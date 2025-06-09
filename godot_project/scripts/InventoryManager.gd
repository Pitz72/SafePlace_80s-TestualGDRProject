# InventoryManager.gd
# Singleton per la gestione dell'inventario del giocatore.

extends Node

# Segnale emesso quando l'inventario cambia. Invia l'inventario aggiornato.
signal inventory_changed(inventory_data)

# L'inventario è un dizionario: {"item_id": quantità}
var inventory: Dictionary = {}

# Elenco degli strumenti che il giocatore possiede (non sono stackabili).
var tools: Array[String] = []

# Riferimento all'ItemDatabase per validare gli oggetti.
@onready var ItemDatabase: Node # Verrà assegnato in _ready

func _ready():
	print("📦 InventoryManager: Inizializzazione...")
	# In una implementazione completa, dovremmo ottenere il riferimento così:
	# ItemDatabase = get_node("/root/ItemDatabase")
	# Ma visto che ItemDatabase non è ancora un autoload, lo lasciamo così per ora.

# --- API Pubblica per la gestione degli Oggetti ---

func add_item(item_id: String, quantity: int = 1):
	"""Aggiunge un oggetto (o più) all'inventario."""
	# Qui ci sarebbe la validazione tramite ItemDatabase

	if inventory.has(item_id):
		inventory[item_id] += quantity
	else:
		inventory[item_id] = quantity

	print("   [Inventory] Aggiunto: %s x%d. Nuovo totale: %d" % [item_id, quantity, inventory[item_id]])
	inventory_changed.emit(inventory)

func remove_item(item_id: String, quantity: int = 1) -> bool:
	"""Rimuove un oggetto (o più) dall'inventario. Restituisce false se non possibile."""
	if not has_item(item_id, quantity):
		printerr("❌ InventoryManager: Impossibile rimuovere %s x%d, quantità insufficiente." % [item_id, quantity])
		return false

	inventory[item_id] -= quantity
	if inventory[item_id] <= 0:
		inventory.erase(item_id)
		print("   [Inventory] Rimosso completamente: %s" % item_id)
	else:
		print("   [Inventory] Rimosso: %s x%d. Nuovo totale: %d" % [item_id, quantity, inventory[item_id]])

	inventory_changed.emit(inventory)
	return true

func has_item(item_id: String, quantity: int = 1) -> bool:
	"""Verifica se il giocatore possiede una certa quantità di un oggetto."""
	return inventory.has(item_id) and inventory[item_id] >= quantity

func has_items(items_array: Array[Dictionary]) -> bool:
	"""Verifica se il giocatore ha tutti gli oggetti richiesti in un array."""
	for item_req in items_array:
		var item_id = item_req["item_id"]
		var quantity = item_req["quantity"]
		if not has_item(item_id, quantity):
			return false
	return true

func get_item_count(item_id: String) -> int:
	"""Restituisce la quantità di un oggetto posseduto."""
	return inventory.get(item_id, 0)

# --- API Pubblica per la gestione degli Strumenti ---

func add_tool(tool_id: String):
	"""Aggiunge uno strumento alla lista degli strumenti posseduti."""
	if not tools.has(tool_id):
		tools.append(tool_id)
		print("   [Inventory] Ottenuto nuovo strumento: %s" % tool_id)
		# Potremmo emettere un segnale anche per il cambio di strumenti
		# tools_changed.emit(tools)

func has_tool(tool_id: String) -> bool:
	"""Verifica se il giocatore possiede un certo strumento."""
	return tools.has(tool_id)

# --- Funzioni per il Salvataggio/Caricamento ---

func get_save_data() -> Dictionary:
	"""Restituisce i dati da salvare."""
	return {
		"inventory": inventory,
		"tools": tools
	}

func load_save_data(data: Dictionary):
	"""Carica i dati da un salvataggio."""
	if data.has("inventory"):
		inventory = data["inventory"]
	if data.has("tools"):
		tools = data["tools"]
	print("💾 InventoryManager: Dati inventario caricati.")
	inventory_changed.emit(inventory)

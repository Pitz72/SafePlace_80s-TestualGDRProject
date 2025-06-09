# Blueprint.gd
# Definisce la struttura di una ricetta di crafting come una Risorsa Godot.

extends Resource
class_name Blueprint

# --- Variabili Esportate ---

# L'ID dell'oggetto che questa ricetta produce (corrisponde a un ID in ItemDatabase)
@export var product_id: String = ""

# La quantità di oggetti prodotti
@export var product_quantity: int = 1

# Gli ingredienti richiesti. Formato: Array[Dictionary]
# Esempio: [{"item_id": "wood_planks", "quantity": 2}, {"item_id": "cloth_rags", "quantity": 1}]
@export var ingredients: Array[Dictionary] = []

# La descrizione della ricetta, visualizzata nell'interfaccia di crafting.
@export var description: String = ""

# (Opzionale) Il messaggio mostrato al giocatore in caso di successo.
@export var success_message: String = ""

# (Opzionale) Gli strumenti richiesti. Formato: Array[String]
# Esempio: ["knife", "hammer"]
@export var required_tools: Array[String] = []

# (Opzionale) Le abilità richieste. Formato: Dictionary
# Esempio: {"mechanics": 10, "survival": 5}
@export var required_skills: Dictionary = {}

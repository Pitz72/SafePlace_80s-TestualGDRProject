# TestScene.gd
# Scena di test per validare i nuovi sistemi di gioco (Inventory, Crafting, PlayerStats).

extends Control

# --- Riferimenti ai Manager (Singleton) ---
@onready var InventoryManager = get_node("/root/InventoryManager")
@onready var CraftingManager = get_node("/root/CraftingManager")
@onready var PlayerStatsManager = get_node("/root/PlayerStatsManager")

# --- Riferimenti ai Nodi UI (che creeremo dinamicamente) ---
var stats_label: Label
var inventory_label: Label
var feedback_label: Label


func _ready():
	print("🧪 TestScene: Inizializzazione della scena di test...")

	# Costruisci l'interfaccia di debug
	_create_debug_ui()

	# Connetti i segnali dai manager per aggiornare la UI in tempo reale
	if PlayerStatsManager:
		PlayerStatsManager.stat_points_changed.connect(_update_all_labels)
		PlayerStatsManager.experience_changed.connect(_update_all_labels)
		PlayerStatsManager.stat_improved.connect(_update_all_labels)
	else:
		printerr("ERRORE CRITICO: PlayerStatsManager non è stato trovato. Controlla il nome in 'project.godot' e che lo script non abbia errori.")

	if InventoryManager:
		InventoryManager.inventory_changed.connect(_update_all_labels)
	else:
		printerr("ERRORE CRITICO: InventoryManager non è stato trovato. Controlla il nome in 'project.godot' e che lo script non abbia errori.")

	# Aggiorna le label una prima volta
	_update_all_labels()


func _create_debug_ui():
	"""
	Crea programmaticamente tutti gli elementi dell'interfaccia di test.
	"""
	# Container principale
	var main_vbox = VBoxContainer.new()
	main_vbox.position = Vector2(20, 20)
	add_child(main_vbox)

	# Sezione Statistiche
	var stats_title = Label.new()
	stats_title.text = "--- STATISTICHE GIOCATORE ---"
	main_vbox.add_child(stats_title)
	stats_label = Label.new()
	stats_label.name = "StatsLabel"
	main_vbox.add_child(stats_label)

	var stats_hbox = HBoxContainer.new()
	main_vbox.add_child(stats_hbox)
	stats_hbox.add_child(_create_test_button("Give 100 EXP", "_on_give_exp_pressed"))
	stats_hbox.add_child(_create_test_button("Improve Strength", "_on_improve_strength_pressed"))

	# Sezione Inventario
	var inv_title = Label.new()
	inv_title.text = "\n--- INVENTARIO ---"
	main_vbox.add_child(inv_title)
	inventory_label = Label.new()
	inventory_label.name = "InventoryLabel"
	main_vbox.add_child(inventory_label)

	var inv_hbox = HBoxContainer.new()
	main_vbox.add_child(inv_hbox)
	inv_hbox.add_child(_create_test_button("Add 5 Rags", "_on_add_rags_pressed"))
	inv_hbox.add_child(_create_test_button("Add 5 Metal Scraps", "_on_add_metal_pressed"))
	inv_hbox.add_child(_create_test_button("Add 1 Knife (Tool)", "_on_add_tool_pressed"))

	# Sezione Crafting
	var craft_title = Label.new()
	craft_title.text = "\n--- CRAFTING ---"
	main_vbox.add_child(craft_title)
	var craft_hbox = HBoxContainer.new()
	main_vbox.add_child(craft_hbox)
	craft_hbox.add_child(_create_test_button("Craft Shiv", "_on_craft_shiv_pressed"))
	craft_hbox.add_child(_create_test_button("Craft Rags Armor", "_on_craft_armor_pressed"))

	# Sezione Feedback
	var feedback_title = Label.new()
	feedback_title.text = "\n--- FEEDBACK ULTIMA AZIONE ---"
	main_vbox.add_child(feedback_title)
	feedback_label = Label.new()
	feedback_label.name = "FeedbackLabel"
	main_vbox.add_child(feedback_label)

func _create_test_button(text: String, callback_name: String) -> Button:
	"""Funzione helper per creare un pulsante di test."""
	var button = Button.new()
	button.text = text
	button.pressed.connect(Callable(self, callback_name))
	return button

# --- Funzioni di Callback per i Pulsanti ---

func _on_give_exp_pressed():
	PlayerStatsManager.award_experience(100, "Pulsante di Test")
	feedback_label.text = "Aggiunti 100 EXP."

func _on_improve_strength_pressed():
	if PlayerStatsManager.available_stat_points > 0:
		var success = PlayerStatsManager.improve_stat("strength")
		if success:
			feedback_label.text = "Forza migliorata!"
		else:
			feedback_label.text = "Non è stato possibile migliorare la Forza."
	else:
		feedback_label.text = "Punti statistica insufficienti!"

func _on_add_rags_pressed():
	InventoryManager.add_item("cloth_rags", 5)
	feedback_label.text = "Aggiunti 5 Stracci."

func _on_add_metal_pressed():
	InventoryManager.add_item("scrap_metal", 5)
	feedback_label.text = "Aggiunti 5 Pezzi di Metallo."

func _on_add_tool_pressed():
	InventoryManager.add_tool("knife")
	feedback_label.text = "Aggiunto lo strumento 'Coltello'."

func _on_craft_shiv_pressed():
	var success = CraftingManager.craft_item("craft_shiv")
	if success:
		feedback_label.text = "Creato Punteruolo Improvvisato!"
	else:
		feedback_label.text = "FALLIMENTO: Non hai le risorse per creare un Punteruolo."

func _on_craft_armor_pressed():
	var success = CraftingManager.craft_item("craft_rags_armor")
	if success:
		feedback_label.text = "Creata Armatura di Stracci!"
	else:
		feedback_label.text = "FALLIMENTO: Non hai le risorse per creare un'Armatura di Stracci."

# --- Funzioni di Aggiornamento UI ---

func _update_all_labels():
	# Aggiorna le statistiche
	var stats_text = ""
	for stat_name in PlayerStatsManager.stats:
		stats_text += "%s: %d\n" % [stat_name.capitalize(), PlayerStatsManager.get_stat(stat_name)]
	stats_text += "\nEsperienza: %d" % PlayerStatsManager.experience
	stats_text += "\nPunti Statistica Disponibili: %d" % PlayerStatsManager.available_stat_points
	stats_label.text = stats_text

	# Aggiorna l'inventario
	var inv_text = "Oggetti:\n"
	if InventoryManager.inventory.is_empty():
		inv_text += "  (vuoto)\n"
	else:
		for item_id in InventoryManager.inventory:
			inv_text += "  - %s: x%d\n" % [item_id, InventoryManager.get_item_count(item_id)]

	inv_text += "\nStrumenti:\n"
	if InventoryManager.tools.is_empty():
		inv_text += "  (nessuno)\n"
	else:
		for tool_id in InventoryManager.tools:
			inv_text += "  - %s\n" % tool_id

	inventory_label.text = inv_text

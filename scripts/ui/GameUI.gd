extends Control

# Script per la UI principale di gioco - The Safe Place v0.1.2
# Gestisce l'interfaccia a tre colonne con integrazione completa PlayerManager
# Autore: LLM Assistant per progetto The Safe Place

class_name GameUI

# ═══ REFERENZE NODI UI - PERCORSI ESATTI ═══

# Pannello Sopravvivenza (Left Panel)
@onready var hp_label: Label = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel/SurvivalVBox/HPLabel
@onready var food_label: Label = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel/SurvivalVBox/FoodLabel
@onready var water_label: Label = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel/SurvivalVBox/WaterLabel

# Pannello Inventario (Left Panel)
@onready var inventory_list: VBoxContainer = $MainLayout/ThreeColumnLayout/LeftPanel/InventoryPanel/InventoryVBox/InventoryScroll/InventoryList

# Pannello Mappa (Center Panel)
@onready var world_viewport: SubViewport = $MainLayout/ThreeColumnLayout/CenterPanel/MapPanel/MapVBox/WorldViewport

# Pannello Diario (Center Panel)
@onready var log_display: RichTextLabel = $MainLayout/ThreeColumnLayout/CenterPanel/LogPanel/LogVBox/LogDisplay

# Pannello Informazioni (Right Panel)
@onready var posizione_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/InfoPanel/InfoVBox/PosizioneLabel
@onready var luogo_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/InfoPanel/InfoVBox/LuogoLabel
@onready var ora_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/InfoPanel/InfoVBox/OraLabel

# Pannello Statistiche (Right Panel)
@onready var strength_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/StatsPanel/StatsVBox/StrengthLabel
@onready var agility_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/StatsPanel/StatsVBox/AgilityLabel
@onready var intelligence_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/StatsPanel/StatsVBox/IntelligenceLabel
@onready var charisma_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/StatsPanel/StatsVBox/CharismaLabel
@onready var luck_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/StatsPanel/StatsVBox/LuckLabel

# Pannello Equipaggiamento (Right Panel)
@onready var weapon_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/EquipmentPanel/EquipmentVBox/WeaponLabel
@onready var armor_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/EquipmentPanel/EquipmentVBox/ArmorLabel

# ═══ VARIABILI INTERNE ═══

var world_scene_instance: Node = null
var ui_update_timer: float = 0.0
var last_player_position: Vector2 = Vector2.ZERO

# ═══ INIZIALIZZAZIONE PRINCIPALE ═══

func _ready():
	print("GameUI: ═══ INIZIALIZZAZIONE UI PRINCIPALE ═══")
	
	# Step 0: Debug referenze nodi
	debug_node_references()
	
	# Step 1: Verifica PlayerManager
	verify_player_manager()
	
	# Step 2: Connetti segnali PlayerManager
	connect_player_manager_signals()
	
	# Step 3: Instanzia la scena World nel viewport
	instantiate_world_scene()
	
	# Step 4: Aggiorna l'UI con valori iniziali
	update_all_ui()
	
	# Step 5: Aggiungi messaggi di benvenuto
	initialize_log_messages()
	
	print("GameUI: ✅ Inizializzazione completata con successo")

# ═══ VERIFICA E SETUP INIZIALE ═══

func debug_node_references():
	"""Debug: verifica quali nodi @onready sono null"""
	print("GameUI: 🔍 DEBUG - Verifica referenze nodi:")
	print("  hp_label: %s" % ("✅ OK" if hp_label else "❌ NULL"))
	print("  food_label: %s" % ("✅ OK" if food_label else "❌ NULL"))
	print("  water_label: %s" % ("✅ OK" if water_label else "❌ NULL"))
	print("  inventory_list: %s" % ("✅ OK" if inventory_list else "❌ NULL"))
	print("  world_viewport: %s" % ("✅ OK" if world_viewport else "❌ NULL"))
	print("  log_display: %s" % ("✅ OK" if log_display else "❌ NULL"))
	print("  posizione_label: %s" % ("✅ OK" if posizione_label else "❌ NULL"))
	print("  luogo_label: %s" % ("✅ OK" if luogo_label else "❌ NULL"))
	print("  ora_label: %s" % ("✅ OK" if ora_label else "❌ NULL"))
	print("  strength_label: %s" % ("✅ OK" if strength_label else "❌ NULL"))
	print("  agility_label: %s" % ("✅ OK" if agility_label else "❌ NULL"))
	print("  intelligence_label: %s" % ("✅ OK" if intelligence_label else "❌ NULL"))
	print("  charisma_label: %s" % ("✅ OK" if charisma_label else "❌ NULL"))
	print("  luck_label: %s" % ("✅ OK" if luck_label else "❌ NULL"))
	print("  weapon_label: %s" % ("✅ OK" if weapon_label else "❌ NULL"))
	print("  armor_label: %s" % ("✅ OK" if armor_label else "❌ NULL"))

func verify_player_manager():
	"""Verifica che PlayerManager sia disponibile"""
	if PlayerManager:
		print("GameUI: ✅ PlayerManager trovato e disponibile")
		print("GameUI: HP: %d/%d | Food: %d/%d | Water: %d/%d" % [
			PlayerManager.hp, PlayerManager.max_hp,
			PlayerManager.food, PlayerManager.max_food, 
			PlayerManager.water, PlayerManager.max_water
		])
	else:
		print("GameUI: ❌ ERRORE CRITICO - PlayerManager non disponibile!")
		push_error("GameUI: PlayerManager Singleton non configurato correttamente")

func instantiate_world_scene():
	"""Instanzia la scena World.tscn nel WorldViewport"""
	if not world_viewport:
		print("GameUI: ❌ world_viewport è null - impossibile istanziare World")
		return
		
	var world_scene = preload("res://scenes/World.tscn")
	if world_scene:
		world_scene_instance = world_scene.instantiate()
		world_viewport.add_child(world_scene_instance)
		print("GameUI: ✅ Scena World.tscn istanziata correttamente nel viewport")
	else:
		print("GameUI: ❌ ERRORE nel caricamento scena World.tscn")
		push_error("GameUI: Impossibile caricare res://scenes/World.tscn")

func initialize_log_messages():
	"""Inizializza il diario con messaggi di benvenuto"""
	add_log_message("═══ BENVENUTO IN THE SAFE PLACE ═══")
	add_log_message("Un mondo post-apocalittico ti aspetta...")
	add_log_message("Usa [WASD] per muoverti sulla mappa")
	add_log_message("Controlla le tue risorse nel pannello sinistro")
	add_log_message("La sopravvivenza dipende dalle tue scelte")

# ═══ CONNESSIONI SEGNALI PLAYERMANAGER ═══

func connect_player_manager_signals():
	"""Connette tutti i segnali del PlayerManager per aggiornamenti automatici"""
	if not PlayerManager:
		print("GameUI: ❌ Impossibile connettere segnali - PlayerManager non disponibile")
		return
	
	# Connetti i tre segnali principali
	var signals_connected = 0
	
	if not PlayerManager.resources_changed.is_connected(_on_resources_changed):
		PlayerManager.resources_changed.connect(_on_resources_changed)
		signals_connected += 1
		print("GameUI: ✅ Segnale resources_changed connesso")
	
	if not PlayerManager.stats_changed.is_connected(_on_stats_changed):
		PlayerManager.stats_changed.connect(_on_stats_changed)
		signals_connected += 1
		print("GameUI: ✅ Segnale stats_changed connesso")
	
	if not PlayerManager.inventory_changed.is_connected(_on_inventory_changed):
		PlayerManager.inventory_changed.connect(_on_inventory_changed)
		signals_connected += 1
		print("GameUI: ✅ Segnale inventory_changed connesso")
	
	print("GameUI: ✅ Tutti i segnali PlayerManager connessi (%d/3)" % signals_connected)

# ═══ CALLBACK SEGNALI PLAYERMANAGER ═══

func _on_resources_changed():
	"""Callback: aggiorna pannello sopravvivenza quando cambiano HP/Food/Water"""
	print("GameUI: 🔄 Risorse cambiate - aggiornamento pannello sopravvivenza")
	update_survival_panel()
	add_log_message("Risorse vitali aggiornate")

func _on_stats_changed():
	"""Callback: aggiorna pannello statistiche quando cambiano le stats RPG"""
	print("GameUI: 🔄 Statistiche cambiate - aggiornamento pannello stats")
	update_stats_panel()
	add_log_message("Statistiche del personaggio aggiornate")

func _on_inventory_changed():
	"""Callback: aggiorna pannello inventario quando cambia l'inventario"""
	print("GameUI: 🔄 Inventario cambiato - aggiornamento pannello inventario")
	update_inventory_panel()
	add_log_message("Inventario aggiornato")

# ═══ AGGIORNAMENTO UI - MASTER FUNCTION ═══

func update_all_ui():
	"""Aggiorna tutti i pannelli dell'interfaccia utente"""
	print("GameUI: 🔄 Aggiornamento completo di tutti i pannelli UI")
	
	update_survival_panel()
	update_stats_panel()
	update_inventory_panel()
	update_equipment_panel()
	update_info_panel()
	
	print("GameUI: ✅ Aggiornamento completo UI terminato")

# ═══ AGGIORNAMENTO PANNELLI SPECIFICI ═══

func update_survival_panel():
	"""Aggiorna pannello sopravvivenza (HP, Food, Water)"""
	if not PlayerManager:
		return
	
	# Verifica che le label esistano prima di aggiornare
	if hp_label:
		hp_label.text = "HP: %d/%d" % [PlayerManager.hp, PlayerManager.max_hp]
		if PlayerManager.hp <= 20:
			hp_label.text += " [CRITICO!]"
	else:
		print("GameUI: ❌ hp_label è null")
	
	if food_label:
		food_label.text = "Sazietà: %d/%d" % [PlayerManager.food, PlayerManager.max_food]
		if PlayerManager.food <= 10:
			food_label.text += " [FAME!]"
	else:
		print("GameUI: ❌ food_label è null")
	
	if water_label:
		water_label.text = "Idratazione: %d/%d" % [PlayerManager.water, PlayerManager.max_water]
		if PlayerManager.water <= 10:
			water_label.text += " [SETE!]"
	else:
		print("GameUI: ❌ water_label è null")

func update_stats_panel():
	"""Aggiorna pannello statistiche RPG"""
	if not PlayerManager:
		return
	
	# Aggiorna tutte le 5 statistiche RPG con protezione null
	if strength_label:
		strength_label.text = "Forza: %d" % PlayerManager.get_stat("forza")
	if agility_label:
		agility_label.text = "Agilità: %d" % PlayerManager.get_stat("agilita")
	if intelligence_label:
		intelligence_label.text = "Intelligenza: %d" % PlayerManager.get_stat("intelligenza")
	if charisma_label:
		charisma_label.text = "Carisma: %d" % PlayerManager.get_stat("carisma")
	if luck_label:
		luck_label.text = "Fortuna: %d" % PlayerManager.get_stat("fortuna")

func update_inventory_panel():
	"""Aggiorna pannello inventario dinamicamente"""
	# Verifica che inventory_list esista
	if not inventory_list:
		print("GameUI: ❌ inventory_list è null")
		return
	
	# Step 1: Pulisci lista esistente
	clear_inventory_display()
	
	if not PlayerManager:
		var error_label = Label.new()
		error_label.text = "[ERROR] PlayerManager non disponibile"
		inventory_list.add_child(error_label)
		return
	
	# Step 2: Aggiungi ogni oggetto dell'inventario - STILE ASCII PURO
	if PlayerManager.inventory.size() == 0:
		var empty_label = Label.new()
		empty_label.text = "- Inventario vuoto -"
		inventory_list.add_child(empty_label)
	else:
		for item in PlayerManager.inventory:
			add_inventory_item_to_display(item)
	
	print("GameUI: ✅ Inventario aggiornato (%d oggetti)" % PlayerManager.inventory.size())

func update_equipment_panel():
	"""Aggiorna pannello equipaggiamento corrente"""
	if not PlayerManager:
		if weapon_label:
			weapon_label.text = "ARMA: [ERRORE]"
		if armor_label:
			armor_label.text = "ARMATURA: [ERRORE]"
		return
	
	# Aggiorna arma equipaggiata - STILE ASCII PURO
	if weapon_label:
		if not PlayerManager.equipped_weapon.is_empty():
			var weapon_name = PlayerManager.equipped_weapon.get("name", "Arma Sconosciuta")
			weapon_label.text = "ARMA: %s" % weapon_name
		else:
			weapon_label.text = "ARMA: Nessuna"
	
	# Aggiorna armatura equipaggiata - STILE ASCII PURO
	if armor_label:
		if not PlayerManager.equipped_armor.is_empty():
			var armor_name = PlayerManager.equipped_armor.get("name", "Armatura Sconosciuta")
			armor_label.text = "ARMATURA: %s" % armor_name
		else:
			armor_label.text = "ARMATURA: Nessuna"

func update_info_panel():
	"""Aggiorna pannello informazioni (posizione, luogo, ora)"""
	# TODO: Implementare quando avremo sistema posizione e tempo reale
	# Per ora usa valori placeholder con protezione null - STILE ASCII PURO
	if posizione_label:
		posizione_label.text = "[POS]: (0,0)"
	if luogo_label:
		luogo_label.text = "[LOC]: Pianura Desolata"
	if ora_label:
		ora_label.text = "[TIME]: 08:00"

# ═══ UTILITY INVENTARIO ═══

func clear_inventory_display():
	"""Pulisce la lista inventario per aggiornamento"""
	for child in inventory_list.get_children():
		child.queue_free()

func add_inventory_item_to_display(item: Dictionary):
	"""Aggiunge un singolo oggetto alla visualizzazione inventario - STILE ASCII"""
	var item_label = Label.new()
	
	# Ottieni dati oggetto dal DataManager
	var item_data = DataManager.get_item_data(item.item_id)
	var item_name = item_data.get("name", item.item_id) if item_data else item.item_id
	
	# Formatta testo con marcatore ASCII e quantità
	var icon = get_item_icon(item_data)
	if item.quantity > 1:
		item_label.text = "%s %s x%d" % [icon, item_name, item.quantity]
	else:
		item_label.text = "%s %s" % [icon, item_name]
	
	inventory_list.add_child(item_label)

func get_item_icon(item_data: Dictionary) -> String:
	"""Restituisce marcatore ASCII basato sul tipo oggetto"""
	if not item_data:
		return "[?]"
	
	var item_type = item_data.get("type", "unknown")
	match item_type:
		"weapon": return "[W]"
		"armor": return "[A]"
		"consumable": return "[C]"
		"ammo": return "[M]"
		"quest": return "[Q]"
		"crafting": return "[T]"
		_: return "[?]"

# ═══ SISTEMA DIARIO ═══

func add_log_message(message: String):
	"""Aggiunge un messaggio timestampato al diario - STILE ASCII"""
	if not log_display:
		print("GameUI: [ERROR] log_display è null - messaggio perso: " + message)
		return
		
	var timestamp = get_current_timestamp()
	var formatted_message = "[color=yellow]%s[/color] %s\n" % [timestamp, message]
	
	log_display.append_text(formatted_message)
	
	# Scroll automatico all'ultimo messaggio
	log_display.scroll_to_line(log_display.get_line_count() - 1)

func get_current_timestamp() -> String:
	"""Genera timestamp per messaggi diario"""
	# TODO: Implementare sistema ora reale del gioco
	return "[08:00]"

func clear_log():
	"""Pulisce completamente il diario"""
	log_display.clear()
	print("GameUI: 🔄 Diario pulito")

# ═══ API PUBBLICHE ═══

func show_system_message(message: String):
	"""Mostra un messaggio di sistema nel diario"""
	add_log_message("[SISTEMA] " + message)

func show_player_action(action: String):
	"""Mostra un'azione del giocatore nel diario"""
	add_log_message("[AZIONE] " + action)

func get_world_scene() -> Node:
	"""Restituisce l'istanza della scena World per accesso esterno"""
	return world_scene_instance

func force_ui_refresh():
	"""Forza aggiornamento completo UI (per debug)"""
	print("GameUI: 🔄 FORCE REFRESH richiesto")
	update_all_ui()

# ═══ INPUT HANDLING E DEBUG ═══

func _input(event):
	"""Gestisce input per debug e test dell'UI"""
	# Debug: ENTER per test messaggio
	if event.is_action_pressed("ui_accept"):
		add_log_message("[DEBUG] Test messaggio - UI funzionante!")
	
	# Debug: ESC per force refresh
	if event.is_action_pressed("ui_cancel"):
		force_ui_refresh()
		show_system_message("UI aggiornata manualmente")

# ═══ PROCESS E UTILITY ═══

func _process(delta):
	"""Update loop per UI dinamica"""
	ui_update_timer += delta
	
	# Aggiorna info panel ogni 2 secondi
	if ui_update_timer >= 2.0:
		update_info_panel()
		ui_update_timer = 0.0

func _notification(what):
	"""Gestisce notifiche di sistema Godot"""
	match what:
		NOTIFICATION_RESIZED:
			# Ricalcola layout quando finestra viene ridimensionata
			print("GameUI: 🔄 Finestra ridimensionata - ricalcolo layout")
		
		NOTIFICATION_VISIBILITY_CHANGED:
			if visible:
				print("GameUI: 👁️ UI resa visibile - aggiornamento automatico")
				update_all_ui()

# ═══ GESTIONE ERRORI ═══

func _on_error_occurred(error_message: String):
	"""Gestisce errori dell'UI"""
	print("GameUI: ❌ ERRORE: " + error_message)
	show_system_message("ERRORE: " + error_message)

# ═══ CLEANUP ═══

func _exit_tree():
	"""Cleanup quando UI viene distrutta"""
	print("GameUI: 🔄 Cleanup UI in corso...")
	
	# Disconnetti segnali se connessi
	if PlayerManager:
		if PlayerManager.resources_changed.is_connected(_on_resources_changed):
			PlayerManager.resources_changed.disconnect(_on_resources_changed)
		if PlayerManager.stats_changed.is_connected(_on_stats_changed):
			PlayerManager.stats_changed.disconnect(_on_stats_changed)
		if PlayerManager.inventory_changed.is_connected(_on_inventory_changed):
			PlayerManager.inventory_changed.disconnect(_on_inventory_changed)
	
	print("GameUI: ✅ Cleanup completato")

# ═══ FINE GAMEUI SCRIPT ═══ 

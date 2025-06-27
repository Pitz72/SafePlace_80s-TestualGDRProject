extends Control

# Script per la UI principale di gioco - The Safe Place v0.1.4+
# Gestisce l'interfaccia a tre colonne con sistema di selezione inventario
# Features: PlayerManager integration + Keyboard inventory navigation
# ARCHITETTURA: MainGame.tscn → World.tscn + GameUI.tscn (con CanvasLayer)
# Autore: LLM Assistant per progetto The Safe Place

class_name GameUI

# ═══ REFERENZE NODI UI - PERCORSI ESATTI ═══

# Pannello Sopravvivenza (Left Panel)
@onready var hp_label: Label = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel/SurvivalVBox/HPLabel
@onready var food_label: Label = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel/SurvivalVBox/FoodLabel
@onready var water_label: Label = $MainLayout/ThreeColumnLayout/LeftPanel/SurvivalPanel/SurvivalVBox/WaterLabel

# Pannello Inventario (Left Panel)
@onready var inventory_list: VBoxContainer = $MainLayout/ThreeColumnLayout/LeftPanel/InventoryPanel/InventoryVBox/InventoryScroll/InventoryList

# Pannello Mappa (Center Panel) - RIPRISTINATO world_viewport
@onready var map_display: TextureRect = $MainLayout/ThreeColumnLayout/CenterPanel/MapPanel/MapVBox/MapDisplay
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

# Pannello Comandi (Right Panel)
@onready var command1_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/CommandsPanel/CommandsVBox/Command1
@onready var command2_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/CommandsPanel/CommandsVBox/Command2  
@onready var command3_label: Label = $MainLayout/ThreeColumnLayout/RightPanel/CommandsPanel/CommandsVBox/Command3

# ═══ VARIABILI INTERNE ═══

var world_scene_instance: Node = null
# var ui_update_timer: float = 0.0  # ❌ RIMOSSO: causava refresh fastidioso ogni 2 secondi
var last_player_position: Vector2 = Vector2.ZERO

# ═══ SISTEMA SELEZIONE INVENTARIO ═══

var selected_inventory_index: int = 0
var is_inventory_active: bool = false

# ═══ INIZIALIZZAZIONE PRINCIPALE ═══

func _ready():
	print("GameUI: ═══ INIZIALIZZAZIONE UI PRINCIPALE (MAINGAME ARCHITECTURE) ═══")
	
	# Step 0: Aggiungi al gruppo per connessione automatica World
	add_to_group("gameui")
	
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
	
	# Step 4: Aggiungi messaggi di benvenuto
	initialize_log_messages()
	
	# Step 5: Debug automatico viewport dopo inizializzazione
	call_deferred("debug_world_viewport")
	
	# Step 6: CONNETTI SEGNALI INPUTMANAGER
	_connect_input_manager()
	
	print("GameUI: ✅ Inizializzazione completata con successo (MainGame.tscn architecture + InputManager)")

# ═══ VERIFICA E SETUP INIZIALE ═══

func debug_node_references():
	"""Debug: verifica quali nodi @onready sono null"""
	print("GameUI: 🔍 DEBUG - Verifica referenze nodi:")
	print("  hp_label: %s" % ("✅ OK" if hp_label else "❌ NULL"))
	print("  food_label: %s" % ("✅ OK" if food_label else "❌ NULL"))
	print("  water_label: %s" % ("✅ OK" if water_label else "❌ NULL"))
	print("  inventory_list: %s" % ("✅ OK" if inventory_list else "❌ NULL"))
	print("  map_display: %s" % ("✅ OK" if map_display else "❌ NULL"))
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
	print("  command1_label: %s" % ("✅ OK" if command1_label else "❌ NULL"))
	print("  command2_label: %s" % ("✅ OK" if command2_label else "❌ NULL"))
	print("  command3_label: %s" % ("✅ OK" if command3_label else "❌ NULL"))

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
	"""Instanzia la scena World.tscn nel WorldViewport del pannello mappa"""
	if not world_viewport:
		print("GameUI: ❌ world_viewport è null - impossibile istanziare World")
		return
		
	var world_scene = preload("res://scenes/World.tscn")
	if world_scene:
		world_scene_instance = world_scene.instantiate()
		world_viewport.add_child(world_scene_instance)
		
		# Configurazione speciale per SubViewport
		world_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
		world_viewport.size = Vector2i(400, 300)  # Dimensione fissa per il monitor
		
		# Configurazioni aggiuntive per il rendering
		world_viewport.snap_2d_transforms_to_pixel = true
		world_viewport.snap_2d_vertices_to_pixel = true
		world_viewport.disable_3d = true  # Forza 2D only
		
		# CRUCIALE: Configurazione input per movimento player nel SubViewport
		world_viewport.gui_disable_input = false  # Abilita ricezione input
		world_viewport.handle_input_locally = true  # SubViewport gestisce input internamente
		world_viewport.physics_object_picking = true  # Abilita interazioni fisiche
		print("GameUI: 🎮 SubViewport configurato per gestire input internamente")
		
		# Configura la camera del World per il SubViewport
		var camera = world_scene_instance.get_node("Camera2D")
		if camera:
			camera.enabled = true
			camera.make_current()
			# APPROCCIO 1: Rimuovo sovrascrittura zoom - World.gd gestisce il suo zoom
			print("GameUI: 📷 Camera2D configurata per SubViewport - zoom gestito da World.gd")
		
		# Forza il World a inizializzarsi
		if world_scene_instance.has_method("_ready"):
			print("GameUI: 🔄 Forzando inizializzazione World...")
		
		# Forza rendering immediato
		world_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
		
		print("GameUI: ✅ Scena World.tscn istanziata nel viewport mappa")
		print("GameUI: 🖥️ SubViewport configurato come 'monitor' 400x300")
		print("GameUI: 📊 World children: %d" % world_scene_instance.get_child_count())
		
		# Collega la texture del SubViewport al TextureRect per visualizzazione
		call_deferred("connect_viewport_to_display")
		
		# PROBLEMA LAYOUT RISOLTO: Configura MapDisplay per riempimento completo
		call_deferred("configure_map_display_scaling")
		
		# Debug immediato per test
		call_deferred("test_viewport_content")
	else:
		print("GameUI: ❌ ERRORE nel caricamento scena World.tscn")
		push_error("GameUI: Impossibile caricare res://scenes/World.tscn")

func initialize_log_messages():
	"""Inizializza il diario con messaggi di benvenuto"""
	add_log_message("═══ BENVENUTO IN THE SAFE PLACE ═══")
	add_log_message("Un mondo post-apocalittico ti aspetta...")
	add_log_message("Usa [WASD] per muoverti sulla mappa")
	add_log_message("Premi [I] per attivare navigazione inventario")
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

# ═══ CONNESSIONI SEGNALI INPUTMANAGER ═══

func _connect_input_manager():
	"""Connette i segnali InputManager per gestione input centralizzata"""
	if not InputManager:
		print("GameUI: ❌ Impossibile connettere segnali - InputManager non disponibile")
		return
	
	# Connetti segnali InputManager
	var signals_connected = 0
	
	if not InputManager.inventory_toggle.is_connected(_on_inventory_toggle):
		InputManager.inventory_toggle.connect(_on_inventory_toggle)
		signals_connected += 1
		print("GameUI: ✅ Segnale inventory_toggle connesso")
	
	if not InputManager.inventory_navigate.is_connected(_on_inventory_navigate):
		InputManager.inventory_navigate.connect(_on_inventory_navigate)
		signals_connected += 1
		print("GameUI: ✅ Segnale inventory_navigate connesso")
	
	if not InputManager.inventory_use_item.is_connected(_on_inventory_use_item):
		InputManager.inventory_use_item.connect(_on_inventory_use_item)
		signals_connected += 1
		print("GameUI: ✅ Segnale inventory_use_item connesso")
	
	if not InputManager.action_cancel.is_connected(_on_action_cancel):
		InputManager.action_cancel.connect(_on_action_cancel)
		signals_connected += 1
		print("GameUI: ✅ Segnale action_cancel connesso")
	
	if not InputManager.action_confirm.is_connected(_on_action_confirm):
		InputManager.action_confirm.connect(_on_action_confirm)
		signals_connected += 1
		print("GameUI: ✅ Segnale action_confirm connesso")
	
	print("GameUI: ✅ Tutti i segnali InputManager connessi (%d/5)" % signals_connected)

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

# ═══ CALLBACK SEGNALI INPUTMANAGER ═══

func _on_inventory_toggle():
	"""Callback: toggle modalità inventario"""
	is_inventory_active = !is_inventory_active
	
	if is_inventory_active:
		# Attiva modalità inventario
		InputManager.set_state(InputManager.InputState.INVENTORY)
		print("GameUI: 🎒 Modalità inventario ATTIVATA")
		add_log_message("Inventario aperto - usa [WASD] per navigare, [1-9] per usare oggetti")
		
		# PROBLEMA 1 RISOLTO: Evidenzia prima voce immediatamente
		if PlayerManager and PlayerManager.inventory.size() > 0:
			selected_inventory_index = 0  # Reset a prima voce
		
		# Disabilita movimento world
		disable_world_movement()
	else:
		# Disattiva modalità inventario
		InputManager.set_state(InputManager.InputState.MAP)
		print("GameUI: 🗺️ Modalità mappa ATTIVATA")
		add_log_message("Inventario chiuso - modalità esplorazione")
		
		# PROBLEMA 2 RISOLTO: Reset evidenziazione quando si esce
		selected_inventory_index = 0
		
		# Riabilita movimento world
		enable_world_movement()
	
	# Aggiorna visual dell'inventario e comandi
	update_inventory_panel()
	update_commands_panel()

func _on_inventory_navigate(direction: Vector2i):
	"""Callback: navigazione inventario con WASD/frecce"""
	if not is_inventory_active:
		return  # Ignora se inventario non attivo
	
	if not PlayerManager or PlayerManager.inventory.size() == 0:
		return  # Nessun oggetto da navigare
	
	# Logica navigazione inventario
	if direction.y == -1:  # SU
		selected_inventory_index -= 1
		if selected_inventory_index < 0:
			selected_inventory_index = PlayerManager.inventory.size() - 1  # Wrap around all'ultimo
	elif direction.y == 1:  # GIÙ
		selected_inventory_index += 1
		if selected_inventory_index >= PlayerManager.inventory.size():
			selected_inventory_index = 0  # Wrap around al primo
	
	print("GameUI: 🎯 Navigazione inventario: index %d" % selected_inventory_index)
	add_log_message("[DEBUG] Selezione inventario: %d" % selected_inventory_index)
	update_inventory_panel()  # Aggiorna evidenziazione

func _on_inventory_use_item(slot_number: int):
	"""Callback: uso oggetto tramite hotkey 1-9 (SEMPRE ATTIVI)"""
	# PROBLEMA 3 RISOLTO: Rimuovi check is_inventory_active
	# I tasti numerici devono funzionare sempre, come nella versione precedente
	
	if not PlayerManager or PlayerManager.inventory.size() == 0:
		print("GameUI: ⚠️ Nessun oggetto nell'inventario")
		return
	
	var item_index = slot_number - 1  # Converti 1-9 in 0-8
	if item_index >= 0 and item_index < PlayerManager.inventory.size():
		var item_slot = PlayerManager.inventory[item_index]
		var item_id = item_slot.item_id
		var item_data = DataManager.get_item_data(item_id)
		var item_name = item_data.get("name", item_id) if item_data else item_id
		
		# Usa oggetto tramite PlayerManager (consumo reale)
		if PlayerManager.use_item(item_id, 1):
			print("GameUI: ✅ Hotkey [%d] - Usato: %s" % [slot_number, item_name])
			add_log_message("Hotkey [%d]: Usato %s" % [slot_number, item_name])
			show_player_action("Hotkey [%d]: Usato %s" % [slot_number, item_name])
		else:
			print("GameUI: ❌ Hotkey [%d] - Impossibile usare: %s" % [slot_number, item_name])
			add_log_message("Hotkey [%d]: Impossibile usare %s" % [slot_number, item_name])
	else:
		print("GameUI: ⚠️ Hotkey [%d] - Slot non valido o vuoto" % slot_number)
		add_log_message("Hotkey [%d]: Slot vuoto" % slot_number)

func _on_action_cancel():
	"""Callback: azione cancellazione (ESC)"""
	if is_inventory_active:
		# Chiudi inventario
		_on_inventory_toggle()
	else:
		# Altre azioni di cancellazione future
		print("GameUI: ↩️ Azione cancel (nessuna azione definita)")

func _on_action_confirm():
	"""Callback: azione conferma (ENTER/SPACE)"""
	if is_inventory_active:
		# PROBLEMA RISOLTO: INVIO usa oggetto selezionato in modalità inventario
		use_selected_inventory_item()
	else:
		# Altre azioni di conferma future (es. dialoghi, interazioni)
		print("GameUI: ✅ Azione confirm (nessuna azione definita)")

# ═══ AGGIORNAMENTO UI - MASTER FUNCTION ═══

func update_all_ui():
	"""Aggiorna tutti i pannelli dell'interfaccia utente"""
	print("GameUI: 🔄 Aggiornamento completo di tutti i pannelli UI")
	
	update_survival_panel()
	update_stats_panel()
	update_inventory_panel()
	update_equipment_panel()
	update_info_panel()
	update_commands_panel()
	
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
	"""Aggiorna pannello inventario dinamicamente con sistema di selezione"""
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
	
	# Step 2: Aggiungi ogni oggetto dell'inventario con selezione visuale - STILE ASCII PURO
	if PlayerManager.inventory.size() == 0:
		var empty_label = Label.new()
		empty_label.text = "- Inventario vuoto -"
		inventory_list.add_child(empty_label)
		# Reset selezione se inventario vuoto
		selected_inventory_index = 0
	else:
		# Assicurati che selected_inventory_index sia valido
		if selected_inventory_index >= PlayerManager.inventory.size():
			selected_inventory_index = PlayerManager.inventory.size() - 1
		if selected_inventory_index < 0:
			selected_inventory_index = 0
			
		# Crea oggetti con indicatore selezione
		for i in range(PlayerManager.inventory.size()):
			var item = PlayerManager.inventory[i]
			var is_selected = (i == selected_inventory_index and is_inventory_active)
			add_inventory_item_to_display_with_selection(item, is_selected)
	
	print("GameUI: ✅ Inventario aggiornato (%d oggetti) - Selezione: %d - Modalità attiva: %s" % [PlayerManager.inventory.size(), selected_inventory_index, is_inventory_active])

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
	"""Aggiorna pannello informazioni (posizione, luogo, ora) - SOLO se non già gestiti"""
	# NOTA: Posizione e luogo ora gestiti da _on_player_moved() in real-time
	# Questo aggiorna solo l'ora (quando sistema temporale sarà implementato)
	
	# Solo l'ora viene aggiornata qui (sistema temporale futuro)
	if ora_label:
		ora_label.text = "[TIME]: 08:00"  # TODO: Implementare sistema tempo reale

func update_commands_panel():
	"""Aggiorna pannello comandi con istruzioni dinamiche"""
	if not command1_label or not command2_label or not command3_label:
		return
		
	# Comandi base sempre disponibili
	command1_label.text = "[WASD] Movimento"
	
	# Comandi dinamici basati su modalità inventario
	if is_inventory_active:
		command2_label.text = "[WS/↑↓] Naviga inv."
		command3_label.text = "[ENTER] Usa oggetto"
	else:
		command2_label.text = "[I] Inventario"
		command3_label.text = "[1-9] Usa oggetto"

# ═══ UTILITY INVENTARIO ═══

func clear_inventory_display():
	"""Pulisce la lista inventario per aggiornamento"""
	for child in inventory_list.get_children():
		child.queue_free()

func add_inventory_item_to_display(item: Dictionary):
	"""Aggiunge un singolo oggetto alla visualizzazione inventario - STILE ASCII"""
	add_inventory_item_to_display_with_selection(item, false)

func add_inventory_item_to_display_with_selection(item: Dictionary, is_selected: bool):
	"""Aggiunge un singolo oggetto alla visualizzazione inventario con indicatore selezione"""
	var item_label = RichTextLabel.new()
	item_label.bbcode_enabled = true
	item_label.fit_content = true
	item_label.scroll_active = false
	
	# Ottieni dati oggetto dal DataManager
	var item_data = DataManager.get_item_data(item.item_id)
	var item_name = item_data.get("name", item.item_id) if item_data else item.item_id
	
	# Calcola numero posizione oggetto nella lista (1-based per display)
	var item_index = -1
	for i in range(PlayerManager.inventory.size()):
		if PlayerManager.inventory[i] == item:
			item_index = i + 1  # Display 1-based (1, 2, 3...)
			break
	
	# Formatta testo con numerazione posizionale e quantità
	var number_marker = "[%d]" % item_index if item_index > 0 else "[?]"
	var base_text = ""
	if item.quantity > 1:
		base_text = "%s %s x%d" % [number_marker, item_name, item.quantity]
	else:
		base_text = "%s %s" % [number_marker, item_name]
	
	# Applica indicatore selezione con evidenziazione forte
	if is_selected:
		# Oggetto selezionato: sfondo verde, testo nero, bordato
		item_label.text = "[bgcolor=#00FF40][color=#000000]>>> %s <<<[/color][/bgcolor]" % base_text
	else:
		# Oggetto non selezionato: testo normale verde
		item_label.text = "[color=#00FF40]  %s[/color]" % base_text
	
	inventory_list.add_child(item_label)

# ═══ NOTA EVOLUZIONE v0.1.3+ ═══
# Sistema inventario migrato da categorie [W][A][C] a numerazione [1][2][3]
# - Marcatori posizionali: [1] primo oggetto, [2] secondo oggetto, etc.
# - Hotkey diretti: Tasti 1-9 per uso immediato oggetti
# - Compatibilità: Navigazione frecce + ENTER mantenuta
# - Principio 8: Architettura keyboard-only implementata
# ═══ ISSUE FIX: UID corrotti rimossi per cache clean ═══

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

func debug_world_viewport():
	"""Debug: verifica stato del WorldViewport e World istanziato"""
	print("GameUI: 🔍 DEBUG WorldViewport:")
	print("  world_viewport: %s" % ("✅ OK" if world_viewport else "❌ NULL"))
	if world_viewport:
		print("  viewport size: %s" % str(world_viewport.size))
		print("  viewport children: %d" % world_viewport.get_child_count())
		print("  render_target_update_mode: %d" % world_viewport.render_target_update_mode)
	print("  world_scene_instance: %s" % ("✅ OK" if world_scene_instance else "❌ NULL"))
	if world_scene_instance:
		print("  world_scene name: %s" % world_scene_instance.name)
		print("  world_scene children: %d" % world_scene_instance.get_child_count())
		
		# Debug specifico dei componenti World
		var camera = world_scene_instance.get_node("Camera2D")
		var tilemap = world_scene_instance.get_node("AsciiTileMap")
		var player = world_scene_instance.get_node("PlayerCharacter")
		
		if camera:
			print("  camera position: %s" % str(camera.position))
			print("  camera zoom: %s" % str(camera.zoom))
			print("  camera enabled: %s" % camera.enabled)
		
		if tilemap:
			print("  tilemap visible: %s" % tilemap.visible)
			print("  tilemap cells: %d" % tilemap.get_used_cells(0).size())
			print("  tilemap tile_set: %s" % ("✅ OK" if tilemap.tile_set else "❌ NULL"))
		
		if player:
			print("  player position: %s" % str(player.position))
			print("  player visible: %s" % player.visible)

func test_viewport_content():
	"""Test: verifica se il SubViewport sta renderizzando qualcosa"""
	if not world_viewport or not world_scene_instance:
		print("GameUI: ❌ Test viewport fallito - componenti mancanti")
		return
	
	print("GameUI: 🧪 TEST VIEWPORT CONTENT:")
	
	# Test 1: Verifica texture del viewport
	var texture = world_viewport.get_texture()
	print("  viewport texture: %s" % ("✅ OK" if texture else "❌ NULL"))
	
	# Test 2: Forza un update
	world_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	
	# Test 3: Verifica la camera e centrala sul player
	var camera = world_scene_instance.get_node("Camera2D")
	var player = world_scene_instance.get_node("PlayerCharacter")
	if camera and player:
		print("  camera current: %s" % camera.is_current())
		# Centra la camera sul player
		camera.position = player.position
		# APPROCCIO 1: Non sovrascrivere zoom - lascia che World.gd gestisca
		print("  camera centered on player at %s" % str(player.position))

func connect_viewport_to_display():
	"""Collega la texture del SubViewport al TextureRect per visualizzazione"""
	if not world_viewport or not map_display:
		print("GameUI: ❌ Impossibile collegare viewport a display - componenti mancanti")
		return
	
	# Ottieni la texture dal SubViewport
	var viewport_texture = world_viewport.get_texture()
	if viewport_texture:
		map_display.texture = viewport_texture
		print("GameUI: 🖼️ Texture SubViewport collegata a MapDisplay")
		print("GameUI: 📏 Texture size: %s" % str(viewport_texture.get_size()))
	else:
		print("GameUI: ❌ Texture SubViewport non disponibile")
		# Riprova dopo un frame
		call_deferred("connect_viewport_to_display")

func configure_map_display_scaling():
	"""Configura MapDisplay per riempimento completo eliminando strisce nere"""
	if map_display:
		# SOLUZIONE RIEMPIMENTO: Forza scaling completo del container
		map_display.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
		map_display.stretch_mode = TextureRect.STRETCH_SCALE  # Scala per riempire completamente
		print("GameUI: 📏 MapDisplay configurato per riempimento completo (STRETCH_SCALE)")

func update_map_camera():
	"""Aggiorna la posizione della camera nella mappa per seguire il player"""
	if not world_scene_instance:
		return
		
	var camera = world_scene_instance.get_node("Camera2D")
	var player = world_scene_instance.get_node("PlayerCharacter")
	
	if camera and player:
		camera.position = player.position
		# APPROCCIO 1: Non sovrascrivere zoom - lascia che World.gd gestisca

# ═══ SISTEMA NAVIGAZIONE INVENTARIO ═══

func toggle_inventory_mode():
	"""Attiva/disattiva modalità navigazione inventario"""
	is_inventory_active = !is_inventory_active
	
	if is_inventory_active:
		# Attiva modalità inventario
		show_system_message("Modalità inventario ATTIVATA - Usa frecce SU/GIÙ per navigare")
		add_log_message("[DEBUG] Navigazione inventario: ATTIVA")
		
		# Reset selezione a primo oggetto se inventario non vuoto
		if PlayerManager and PlayerManager.inventory.size() > 0:
			selected_inventory_index = 0
		
		# Disabilita movimento world (TODO: implementare quando necessario)
		disable_world_movement()
	else:
		# Disattiva modalità inventario
		show_system_message("Modalità inventario DISATTIVATA")
		add_log_message("[DEBUG] Navigazione inventario: DISATTIVA")
		
		# Riabilita movimento world
		enable_world_movement()
	
	# Aggiorna visual dell'inventario e comandi
	update_inventory_panel()
	update_commands_panel()

func use_selected_inventory_item():
	"""Usa l'oggetto attualmente selezionato nell'inventario"""
	if not PlayerManager or PlayerManager.inventory.size() == 0:
		add_log_message("[ERROR] Nessun oggetto da usare")
		return
	
	if selected_inventory_index < 0 or selected_inventory_index >= PlayerManager.inventory.size():
		add_log_message("[ERROR] Selezione inventario non valida")
		return
	
	var selected_item = PlayerManager.inventory[selected_inventory_index]
	var item_data = DataManager.get_item_data(selected_item.item_id)
	var item_name = item_data.get("name", selected_item.item_id) if item_data else selected_item.item_id
	
	# Usa oggetto tramite PlayerManager (consumo reale)
	var success = PlayerManager.use_item(selected_item.item_id, 1)
	
	if success:
		show_player_action("Hai usato: %s" % item_name)
		add_log_message("[AZIONE] Oggetto consumato: %s" % item_name)
		
		# Aggiusta la selezione se l'oggetto era l'ultimo nella lista
		if selected_inventory_index >= PlayerManager.inventory.size() and PlayerManager.inventory.size() > 0:
			selected_inventory_index = PlayerManager.inventory.size() - 1
	else:
		add_log_message("[ERROR] Impossibile usare: %s" % item_name)

func disable_world_movement():
	"""Disabilita movimento nel world quando inventario è attivo"""
	# TODO: Implementare quando avremo integrazione movement controller
	# Per ora solo log
	print("GameUI: 🔒 Movimento world disabilitato (inventario attivo)")

func enable_world_movement():
	"""Riabilita movimento nel world quando inventario è disattivo"""
	# TODO: Implementare quando avremo integrazione movement controller  
	# Per ora solo log
	print("GameUI: 🔓 Movimento world riabilitato (inventario disattivo)")

# ═══ INPUT HANDLING TRAMITE INPUTMANAGER ═══
# 
# NOTA: Logica input centralizzata in InputManager.gd
# GameUI ora riceve eventi tramite segnali InputManager:
# - inventory_toggle() → _on_inventory_toggle()
# - inventory_navigate() → _on_inventory_navigate()  
# - inventory_use_item() → _on_inventory_use_item()
# - action_cancel() → _on_action_cancel()
#
# Movimento mappa gestito direttamente da World.gd tramite InputManager.map_move

# ═══ PROCESS E UTILITY ═══
# 
# NOTA: Timer automatico RIMOSSO per evitare refresh fastidioso delle coordinate
# Le informazioni posizione/luogo sono ora gestite real-time da _on_player_moved()
# Solo l'ora sarà gestita qui quando il sistema temporale sarà implementato

# func _process(delta):  # ❌ FUNZIONE RIMOSSA
	# """Update loop per UI dinamica"""
	# ui_update_timer += delta
	# 
	# # Aggiorna info panel ogni 2 secondi
	# if ui_update_timer >= 2.0:
	# 	update_info_panel()
	# 	update_map_camera()  # Aggiorna anche la camera della mappa
	# 	ui_update_timer = 0.0

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

func add_world_log(message: String):
	"""Aggiunge un messaggio di movimento dal World al diario"""
	if not log_display:
		print("GameUI: [ERROR] log_display è null - messaggio World perso: " + message)
		return
	
	var timestamp = get_current_timestamp()
	var formatted_message = "[color=cyan]%s[/color] [color=lightgreen][MONDO][/color] %s\n" % [timestamp, message]
	
	log_display.append_text(formatted_message)
	
	# Scroll automatico all'ultimo messaggio
	log_display.scroll_to_line(log_display.get_line_count() - 1)

func _on_player_moved(new_position: Vector2i, terrain_type: String):
	"""Callback per aggiornamento pannello informazioni quando player si muove"""
	
	# Aggiorna label posizione
	if posizione_label:
		posizione_label.text = "Posizione: [%d, %d]" % [new_position.x, new_position.y]
	
	# Aggiorna label luogo/terreno
	if luogo_label:
		luogo_label.text = "Luogo: %s" % terrain_type
	
	print("GameUI: 📍 Pannello info aggiornato - Pos: %s, Terreno: %s" % [str(new_position), terrain_type])

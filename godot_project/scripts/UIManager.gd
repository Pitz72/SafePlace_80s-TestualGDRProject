class_name UIManager
extends Node

## UIManager - Coordinatore Centrale Interfacce Utente
## Session #006 - UI/UX Systems Implementation

# Signal definitions per UI events
signal ui_state_changed(new_state: UIState)
signal interface_opened(interface_name: String)
signal interface_closed(interface_name: String)

# UI State enum
enum UIState {
	HIDDEN,      # No UI active
	HUD,         # Only HUD visible  
	INVENTORY,   # Inventory interface
	COMBAT,      # Combat interface
	MAP,         # Map interface
	MENU,        # Main menu
	SETTINGS     # Settings interface
}

# Current UI state
var current_state: UIState = UIState.HUD
var previous_state: UIState = UIState.HUD

# References to UI components (will be set from GameManager)
var hud: Control
var inventory_ui: Control  
var combat_ui: Control
var map_ui: Control
var menu_ui: Control
var settings_ui: Control

# References to game systems
var game_manager
var player: Player

# UI settings
var ui_scale: float = 1.0
var animations_enabled: bool = true
var transition_duration: float = 0.3

func _ready():
	print("[UIManager] Initializing SafePlace UI coordination system...")
	
	# Connect to GameManager if available
	if get_parent().has_method("get_game_manager"):
		game_manager = get_parent().get_game_manager()
		_connect_game_signals()
	
	# Auto-discover UI components from scene tree
	_auto_discover_ui_components()
	
	# Setup UI state
	set_ui_state(UIState.HUD)
	print("[UIManager] SafePlace UI Manager ready - State: ", UIState.keys()[current_state])

func _connect_game_signals():
	"""Connect to GameManager signals for UI coordination"""
	if game_manager:
		if game_manager.has_signal("game_state_changed"):
			game_manager.game_state_changed.connect(_on_game_state_changed)
		
		if game_manager.has_signal("combat_started"):
			game_manager.combat_started.connect(_on_combat_started)
		
		if game_manager.has_signal("combat_ended"):
			game_manager.combat_ended.connect(_on_combat_ended)
		
		print("[UIManager] Connected to GameManager signals")

func _auto_discover_ui_components():
	"""Automatically find UI components from Main scene tree"""
	var main_node = get_tree().current_scene
	if main_node:
		# Find UI components in UIContainer
		var ui_container = main_node.get_node_or_null("UIContainer")
		if ui_container:
			hud = ui_container.get_node_or_null("GameUI/HUD")
			inventory_ui = ui_container.get_node_or_null("InventoryUI")
			combat_ui = ui_container.get_node_or_null("CombatUI")
			map_ui = ui_container.get_node_or_null("MapUI")
			menu_ui = ui_container.get_node_or_null("MenuUI")
			settings_ui = ui_container.get_node_or_null("SettingsUI")
			
			print("[UIManager] SafePlace UI components discovered:")
			print("  HUD: ", hud != null)
			print("  Inventory: ", inventory_ui != null)
			print("  Combat: ", combat_ui != null)
			print("  Map: ", map_ui != null)
			print("  Menu: ", menu_ui != null)
			print("  Settings: ", settings_ui != null)

func set_player_reference(player_ref: Player):
	"""Set player reference for stats synchronization"""
	player = player_ref
	if player and player.has_signal("stats_changed"):
		player.stats_changed.connect(_on_player_stats_changed)
		print("[UIManager] Connected to Player stats updates")

func set_ui_state(new_state: UIState):
	"""Change UI state and show/hide appropriate interfaces"""
	if new_state == current_state:
		return
	
	previous_state = current_state
	current_state = new_state
	
	print("[UIManager] UI State: ", UIState.keys()[previous_state], " → ", UIState.keys()[current_state])
	
	# Hide all interfaces first
	_hide_all_interfaces()
	
	# Show appropriate interface for new state
	match current_state:
		UIState.HIDDEN:
			_show_nothing()
		UIState.HUD:
			_show_hud()
		UIState.INVENTORY:
			_show_inventory()
		UIState.COMBAT:
			_show_combat()
		UIState.MAP:
			_show_map()
		UIState.MENU:
			_show_menu()
		UIState.SETTINGS:
			_show_settings()
	
	# Emit state change signal
	ui_state_changed.emit(current_state)

func _hide_all_interfaces():
	"""Hide all UI interfaces"""
	if hud: hud.visible = false
	if inventory_ui: inventory_ui.visible = false
	if combat_ui: combat_ui.visible = false
	if map_ui: map_ui.visible = false
	if menu_ui: menu_ui.visible = false
	if settings_ui: settings_ui.visible = false

func _show_nothing():
	"""Show no interfaces (complete hidden state)"""
	pass  # All interfaces already hidden

func _show_hud():
	"""Show HUD interface"""
	if hud:
		hud.visible = true
		interface_opened.emit("hud")

func _show_inventory():
	"""Show inventory interface + HUD"""
	if hud: hud.visible = true
	if inventory_ui:
		inventory_ui.visible = true
		interface_opened.emit("inventory")

func _show_combat():
	"""Show combat interface + HUD"""
	if hud: hud.visible = true
	if combat_ui:
		combat_ui.visible = true
		interface_opened.emit("combat")

func _show_map():
	"""Show map interface + HUD"""
	if hud: hud.visible = true
	if map_ui:
		map_ui.visible = true
		interface_opened.emit("map")

func _show_menu():
	"""Show main menu interface"""
	if menu_ui:
		menu_ui.visible = true
		interface_opened.emit("menu")

func _show_settings():
	"""Show settings interface"""
	if settings_ui:
		settings_ui.visible = true
		interface_opened.emit("settings")

# Input handling for UI state changes
func _input(event):
	if event.is_action_pressed("ui_cancel"):  # ESC key
		_handle_escape_key()
	elif event.is_action_pressed("open_inventory"):  # I key
		_handle_inventory_toggle()
	elif event.is_action_pressed("open_map"):  # M key
		_handle_map_toggle()

func _handle_escape_key():
	"""Handle ESC key for UI navigation"""
	match current_state:
		UIState.INVENTORY, UIState.MAP, UIState.SETTINGS:
			set_ui_state(UIState.HUD)
		UIState.HUD:
			set_ui_state(UIState.MENU)
		UIState.MENU:
			set_ui_state(UIState.HUD)
		UIState.COMBAT:
			pass  # No ESC during combat

func _handle_inventory_toggle():
	"""Toggle inventory interface"""
	if current_state == UIState.INVENTORY:
		set_ui_state(UIState.HUD)
	elif current_state == UIState.HUD:
		set_ui_state(UIState.INVENTORY)

func _handle_map_toggle():
	"""Toggle map interface"""
	if current_state == UIState.MAP:
		set_ui_state(UIState.HUD)
	elif current_state == UIState.HUD:
		set_ui_state(UIState.MAP)

# Signal handlers for game events
func _on_game_state_changed(new_game_state):
	"""Handle GameManager state changes"""
	# Use string comparison instead of enum to avoid parsing issues
	var game_state_name = str(new_game_state)
	match game_state_name:
		"1": # COMBAT state
			set_ui_state(UIState.COMBAT)
		"2": # PLAYING state
			if current_state == UIState.COMBAT:
				set_ui_state(UIState.HUD)
		"5": # MAIN_MENU state
			set_ui_state(UIState.MENU)

func _on_combat_started():
	"""Handle combat start"""
	set_ui_state(UIState.COMBAT)

func _on_combat_ended():
	"""Handle combat end"""
	set_ui_state(UIState.HUD)

func _on_player_stats_changed():
	"""Handle player stats updates - refresh HUD"""
	if hud and hud.has_method("update_display"):
		hud.update_display()

# Public API for other systems
func show_notification(message: String, duration: float = 3.0):
	"""Show notification message to player"""
	print("[UIManager] Notification: ", message)
	# TODO: Implement notification system

func get_current_state() -> UIState:
	"""Get current UI state"""
	return current_state

func is_interface_blocking() -> bool:
	"""Check if current interface blocks game input"""
	return current_state in [UIState.MENU, UIState.SETTINGS, UIState.INVENTORY]

# Debug and testing functions
func get_debug_info() -> Dictionary:
	"""Get debug information about UI state"""
	return {
		"current_state": UIState.keys()[current_state],
		"previous_state": UIState.keys()[previous_state],
		"ui_scale": ui_scale,
		"animations_enabled": animations_enabled,
		"components_connected": {
			"hud": hud != null,
			"inventory_ui": inventory_ui != null,
			"combat_ui": combat_ui != null,
			"map_ui": map_ui != null,
			"menu_ui": menu_ui != null
		}
	}

func _debug_test_ui_states():
	"""Debug function to test all UI states"""
	print("[UIManager] Testing all UI states...")
	for state in UIState.values():
		set_ui_state(state)
		await get_tree().create_timer(1.0).timeout
	set_ui_state(UIState.HUD)
	print("[UIManager] UI state testing complete") 
class_name UIManager
extends Node

## UIManager - Coordinatore Centrale Interfacce Utente
## Session #006 - UI/UX Systems Implementation

# Signal definitions per UI events
signal ui_state_changed(new_state: String)
signal interface_opened(interface_name: String)
signal interface_closed(interface_name: String)

# UI State enum
enum UIState {
	HIDDEN,      # No UI active
	MAIN_INTERFACE, # Main interface
	HUD,         # Only HUD visible  
	COMBAT,      # Combat interface
	MENU,        # Main menu
	SETTINGS     # Settings interface
}

# Current UI state
var current_state: UIState = UIState.MAIN_INTERFACE
var previous_state: UIState = UIState.MAIN_INTERFACE

# References to UI components (will be set from GameManager)
var main_interface: MainInterface
var hud: Control

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
	set_ui_state(UIState.MAIN_INTERFACE)
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
			main_interface = ui_container.get_node_or_null("MainInterface")
			hud = ui_container.get_node_or_null("HUD")
			
			print("[UIManager] SafePlace UI components discovered:")
			print("  MainInterface: ", main_interface != null)
			print("  HUD: ", hud != null)

func initialize_main_interface(gm: GameManager):
	"""Initialize MainInterface with GameManager reference"""
	game_manager = gm
	if main_interface and main_interface.has_method("initialize"):
		main_interface.initialize(gm)
		print("[UIManager] MainInterface inizializzata con GameManager")

func set_player_reference(player_ref: Player):
	"""Set player reference for stats synchronization"""
	player = player_ref
	if main_interface:
		main_interface.player = player
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
		UIState.MAIN_INTERFACE:
			_show_main_interface()
		UIState.HUD:
			_show_hud()
		UIState.COMBAT:
			_show_combat()
		UIState.MENU:
			_show_menu()
		UIState.SETTINGS:
			_show_settings()
	
	# Emit state change signal
	ui_state_changed.emit(_ui_state_to_string(current_state))

func _hide_all_interfaces():
	"""Hide all UI interfaces"""
	if main_interface: main_interface.visible = false
	if hud: hud.visible = false

func _show_nothing():
	"""Show no interfaces (complete hidden state)"""
	pass  # All interfaces already hidden

func _show_main_interface():
	"""Show main interface"""
	if main_interface:
		main_interface.visible = true
		interface_opened.emit("main_interface")

func _show_hud():
	"""Show HUD interface"""
	if hud:
		hud.visible = true
		interface_opened.emit("hud")

func _show_combat():
	"""Show combat interface + HUD"""
	if hud: hud.visible = true

func _show_menu():
	"""Show main menu interface"""
	if main_interface:
		main_interface.visible = true
		interface_opened.emit("menu")

func _show_settings():
	"""Show settings interface"""
	if main_interface:
		main_interface.visible = true
		interface_opened.emit("settings")

# Input handling for UI state changes
func _input(event):
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_ESCAPE:
				_handle_escape()
			KEY_H:
				_toggle_hud()

func _handle_escape():
	"""Handle ESC key for UI navigation"""
	match current_state:
		UIState.MAIN_INTERFACE:
			_show_hud()
		UIState.HUD:
			_show_main_interface()
		UIState.MENU:
			_show_main_interface()
		UIState.COMBAT:
			pass  # No ESC during combat

func _toggle_hud():
	"""Toggle HUD"""
	if current_state == UIState.HUD:
		_show_main_interface()
	elif current_state == UIState.MAIN_INTERFACE:
		_show_hud()

# Signal handlers for game events
func _on_game_state_changed(new_game_state):
	"""Handle GameManager state changes"""
	# Convert GameState enum to UIState properly
	match new_game_state:
		GameManager.GameState.COMBAT:
			set_ui_state(UIState.COMBAT)
		GameManager.GameState.PLAYING:
			if current_state == UIState.COMBAT:
				set_ui_state(UIState.HUD)
		GameManager.GameState.MAIN_MENU:
			set_ui_state(UIState.MENU)
		GameManager.GameState.INVENTORY:
			set_ui_state(UIState.MAIN_INTERFACE)
		_:
			# Default to HUD for other states
			if current_state != UIState.MAIN_INTERFACE:
				set_ui_state(UIState.HUD)

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

func get_current_state() -> String:
	"""Get current UI state"""
	return _ui_state_to_string(current_state)

func is_interface_blocking_input() -> bool:
	"""Check if current interface blocks game input"""
	return current_state in [UIState.MENU, UIState.SETTINGS]

# Debug and testing functions
func get_debug_info() -> Dictionary:
	"""Get debug information about UI state"""
	return {
		"current_state": UIState.keys()[current_state],
		"previous_state": UIState.keys()[previous_state],
		"ui_scale": ui_scale,
		"animations_enabled": animations_enabled,
		"components_connected": {
			"main_interface": main_interface != null,
			"hud": hud != null
		}
	}

func _debug_test_ui_states():
	"""Debug function to test all UI states"""
	print("[UIManager] Testing all UI states...")
	for state in UIState.values():
		set_ui_state(state)
		await get_tree().create_timer(1.0).timeout
	set_ui_state(UIState.MAIN_INTERFACE)
	print("[UIManager] UI state testing complete")

func _ui_state_to_string(state: UIState) -> String:
	match state:
		UIState.HIDDEN: return "HIDDEN"
		UIState.MAIN_INTERFACE: return "MAIN_INTERFACE"
		UIState.HUD: return "HUD"
		UIState.COMBAT: return "COMBAT"
		UIState.MENU: return "MENU"
		UIState.SETTINGS: return "SETTINGS"
		_: return "UNKNOWN" 

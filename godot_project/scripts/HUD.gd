class_name HUD
extends Control

## HUD - Heads-Up Display Interface SafePlace
## Session #006 - Primary game interface with player stats

# References to UI elements (assigned from scene automatically)
@onready var hp_bar: ProgressBar = $HPBar
@onready var food_bar: ProgressBar = $FoodBar  
@onready var water_bar: ProgressBar = $WaterBar
@onready var exp_bar: ProgressBar = $EXPBar
@onready var level_label: Label = $LevelLabel
@onready var location_label: Label = $LocationLabel
@onready var movement_label: Label = $MovementLabel
@onready var menu_button: Button = $MenuButton

# SafePlace specific UI elements
@onready var stats_panel: Panel = $StatsPanel
@onready var stats_label: RichTextLabel = $StatsPanel/StatsLabel

# Bar labels for SafePlace styling
@onready var hp_label: Label = $HPBar/HPLabel
@onready var food_label: Label = $FoodBar/FoodLabel
@onready var water_label: Label = $WaterBar/WaterLabel
@onready var exp_label: Label = $EXPBar/EXPLabel

# References to game systems
var player: Player
var ui_manager: UIManager
var game_manager

# HUD update settings
var update_frequency: float = 0.1  # Update every 100ms
var last_update_time: float = 0.0

func _ready():
	print("[HUD] Initializing heads-up display...")
	
	# Setup HUD
	_setup_hud_elements()
	
	print("[HUD] HUD interface ready")

func _setup_hud_elements():
	"""Setup HUD visual elements and initial state"""
	if menu_button and menu_button.has_signal("pressed"):
		menu_button.pressed.connect(_on_menu_button_pressed)
	
	# Set initial values
	update_display()

func set_references(player_ref: Player, ui_manager_ref: UIManager, game_manager_ref):
	"""Set references to game systems"""
	player = player_ref
	ui_manager = ui_manager_ref
	game_manager = game_manager_ref
	
	# Connect to player signals
	if player and player.has_signal("stats_changed"):
		player.stats_changed.connect(_on_player_stats_changed)
	
	print("[HUD] System references connected")

func _process(delta):
	"""Update HUD periodically"""
	last_update_time += delta
	if last_update_time >= update_frequency:
		update_display()
		last_update_time = 0.0

func update_display():
	"""Update all HUD elements with current player data"""
	if not player:
		return
	
	_update_health_display()
	_update_resources_display()
	_update_level_display()
	_update_location_display()

func _update_health_display():
	"""Update HP bar and label"""
	if hp_bar and player:
		var hp_percentage = float(player.hp) / float(player.max_hp) if player.max_hp > 0 else 0.0
		hp_bar.value = hp_percentage * 100
		
		# Update HP label text
		if hp_label:
			hp_label.text = "HP: %d/%d" % [player.hp, player.max_hp]
		
		# Update HP bar color based on health level (SafePlace style)
		var style = hp_bar.get("theme_override_styles/fill")
		if style and style is StyleBoxFlat:
			if hp_percentage > 0.7:
				style.bg_color = Color.GREEN
			elif hp_percentage > 0.3:
				style.bg_color = Color.YELLOW  
			else:
				style.bg_color = Color.RED

func _update_resources_display():
	"""Update food and water bars"""
	if food_bar and player:
		food_bar.value = player.food
		if food_label:
			food_label.text = "Food: %d" % player.food
	
	if water_bar and player:
		water_bar.value = player.water
		if water_label:
			water_label.text = "Water: %d" % player.water

func _update_level_display():
	"""Update level and experience display"""
	if level_label and player:
		level_label.text = "Level: %d" % player.level
	
	if exp_bar and player:
		# Calculate EXP progress to next level (SafePlace formula)
		var exp_needed = _calculate_exp_for_level(player.level + 1)
		var exp_current_level = _calculate_exp_for_level(player.level)
		var exp_progress = player.exp - exp_current_level
		var exp_for_next = exp_needed - exp_current_level
		
		if exp_for_next > 0:
			var exp_percentage = float(exp_progress) / float(exp_for_next)
			exp_bar.value = exp_percentage * 100
		else:
			exp_bar.value = 100
			
		# Update EXP label
		if exp_label:
			exp_label.text = "EXP: %d/%d" % [exp_progress, exp_for_next]

func _update_location_display():
	"""Update location and movement points display"""
	if location_label and game_manager and game_manager.map_manager:
		var current_location = game_manager.map_manager.get_current_location_name()
		location_label.text = "Location: " + current_location
	
	if movement_label and game_manager and game_manager.map_manager:
		var movement_points = game_manager.map_manager.get_movement_points()
		var max_movement = game_manager.map_manager.get_max_movement_points()
		movement_label.text = "Movement: " + str(movement_points) + "/" + str(max_movement)

func _calculate_exp_for_level(level: int) -> int:
	"""Calculate total EXP needed for given level"""
	# SafePlace EXP formula: level^2 * 100
	return (level - 1) * (level - 1) * 100

# Signal handlers
func _on_player_stats_changed():
	"""Handle player stats changes"""
	update_display()

func _on_menu_button_pressed():
	"""Handle menu button click"""
	if ui_manager:
		ui_manager.set_ui_state(UIManager.UIState.MENU)

# Public API for external updates
func show_damage_indicator(damage: int):
	"""Show visual damage indicator"""
	print("[HUD] Damage taken: -", damage)
	# TODO: Implement damage popup animation

func show_heal_indicator(heal: int):
	"""Show visual heal indicator"""
	print("[HUD] Health restored: +", heal)
	# TODO: Implement heal popup animation

func show_level_up_indicator():
	"""Show level up celebration"""
	print("[HUD] LEVEL UP!")
	# TODO: Implement level up animation

func show_status_effect(effect_name: String, duration: float):
	"""Show status effect indicator"""
	print("[HUD] Status Effect: ", effect_name, " (", duration, "s)")
	# TODO: Implement status effect icons

# HUD text-based display (fallback for when UI elements aren't available)
func get_text_display() -> String:
	"""Get text representation of HUD data"""
	if not player:
		return "[HUD] Player data not available"
	
	var text = ""
	text += "[color=green]SAFEPLACE STATUS[/color]\n"
	text += "HP: " + str(player.hp) + "/" + str(player.max_hp) + "\n"
	text += "Food: " + str(player.food) + "\n"
	text += "Water: " + str(player.water) + "\n"
	text += "Level: " + str(player.level) + " (EXP: " + str(player.exp) + ")\n"
	
	if game_manager and game_manager.map_manager:
		text += "Location: " + game_manager.map_manager.get_current_location_name() + "\n"
		var movement = game_manager.map_manager.get_movement_points()
		var max_movement = game_manager.map_manager.get_max_movement_points()
		text += "Movement: " + str(movement) + "/" + str(max_movement) + "\n"
	
	return text

# Debug functions
func get_debug_info() -> Dictionary:
	"""Get debug information about HUD state"""
	return {
		"player_connected": player != null,
		"ui_manager_connected": ui_manager != null,
		"game_manager_connected": game_manager != null,
		"update_frequency": update_frequency,
		"ui_elements": {
			"hp_bar": hp_bar != null,
			"food_bar": food_bar != null,
			"water_bar": water_bar != null,
			"exp_bar": exp_bar != null,
			"level_label": level_label != null,
			"location_label": location_label != null,
			"movement_label": movement_label != null,
			"menu_button": menu_button != null
		}
	} 
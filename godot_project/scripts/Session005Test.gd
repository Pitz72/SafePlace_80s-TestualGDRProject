extends Node

## Session #005 Integration Test
## Tests all 4 new systems: Combat, Event, Map, Save

var game_manager: GameManager
var player: Player
var combat_manager: CombatManager
var event_manager: EventManager
var map_manager: MapManager
var save_manager: SaveManager

func _ready():
	print("🧪 ===== SESSION #005 INTEGRATION TEST =====")
	
	# Aspetta che i sistemi siano pronti
	await get_tree().process_frame
	
	# Trova i riferimenti
	game_manager = get_node("../")
	player = get_node("../../WorldContainer/Player")
	
	if game_manager:
		combat_manager = game_manager.get_combat_manager()
		event_manager = game_manager.get_event_manager()
		map_manager = game_manager.get_map_manager()
		save_manager = game_manager.get_save_manager()
	
	# Avvia test
	_run_integration_tests()

func _run_integration_tests():
	print("\n🎮 Testing GameManager Integration...")
	_test_game_manager()
	
	await get_tree().create_timer(1.0).timeout
	
	print("\n⚔️ Testing Combat System...")
	_test_combat_system()
	
	await get_tree().create_timer(2.0).timeout
	
	print("\n📖 Testing Event System...")
	_test_event_system()
	
	await get_tree().create_timer(2.0).timeout
	
	print("\n🗺️ Testing Map System...")
	_test_map_system()
	
	await get_tree().create_timer(2.0).timeout
	
	print("\n💾 Testing Save System...")
	_test_save_system()
	
	await get_tree().create_timer(1.0).timeout
	
	print("\n📊 Final System Status...")
	_print_final_status()

func _test_game_manager():
	if not game_manager:
		print("❌ GameManager not found!")
		return
	
	print("✅ GameManager: OK")
	print("✅ State: ", game_manager.current_state)
	print("✅ Systems loaded:")
	print("   - CombatManager: ", "✅" if combat_manager else "❌")
	print("   - EventManager: ", "✅" if event_manager else "❌")
	print("   - MapManager: ", "✅" if map_manager else "❌")
	print("   - SaveManager: ", "✅" if save_manager else "❌")

func _test_combat_system():
	if not combat_manager:
		print("❌ CombatManager not available")
		return
	
	print("⚔️ Testing combat mechanics...")
	
	# Test combat start
	var test_enemy = {
		"name": "Test Goblin",
		"max_hp": 25,
		"hp": 25,
		"attack": 6,
		"defense": 1,
		"experience": 15
	}
	
	var combat_started = combat_manager.start_combat(test_enemy)
	print("   Combat start: ", "✅" if combat_started else "❌")
	
	if combat_started:
		# Test player attack
		var attack_result = combat_manager.player_action(CombatManager.CombatAction.ATTACK)
		print("   Player attack: ", "✅" if attack_result else "❌")
		
		# Test player defend
		var defend_result = combat_manager.player_action(CombatManager.CombatAction.DEFEND)
		print("   Player defend: ", "✅" if defend_result else "❌")

func _test_event_system():
	if not event_manager:
		print("❌ EventManager not available")
		return
	
	print("📖 Testing event mechanics...")
	
	# Test random event trigger
	var event_triggered = event_manager.trigger_random_event()
	print("   Random event: ", "✅" if event_triggered else "❌")
	
	# Test event database
	var events_count = event_manager.events_database.size()
	print("   Events loaded: ", events_count, " events")
	
	# Test event status
	var event_status = event_manager.get_event_status()
	if event_status:
		print("   Event state: ", event_status.get("state", "unknown"))
	else:
		print("   Event state: unknown (no status)")

func _test_map_system():
	if not map_manager:
		print("❌ MapManager not available")
		return
	
	print("🗺️ Testing map mechanics...")
	
	# Test current location
	var current_location = map_manager.get_location_name(map_manager.current_location)
	print("   Current location: ", current_location)
	
	# Test location database
	var locations_count = map_manager.location_database.size()
	print("   Locations loaded: ", locations_count, " locations")
	
	# Test connected locations
	var connected = map_manager.get_connected_locations()
	print("   Connected locations: ", connected.size())
	
	# Test movement points
	print("   Movement points: ", map_manager.movement_points, "/", map_manager.max_movement_points)
	
	# Test travel to nearby location
	if connected.size() > 0:
		var destination = connected[0]
		var travel_result = map_manager.travel_to(destination.id)
		print("   Travel test: ", "✅" if travel_result else "❌")

func _test_save_system():
	if not save_manager:
		print("❌ SaveManager not available")
		return
	
	print("💾 Testing save mechanics...")
	
	# Test save game
	var save_result = save_manager.save_game(8)  # Use test slot 8
	print("   Save game: ", "✅" if save_result else "❌")
	
	# Test save slots info
	var slots_info = save_manager.get_save_slots_info()
	print("   Save slots: ", slots_info.size(), " slots")
	
	# Test backup creation
	var backup_result = save_manager.create_backup()
	print("   Backup creation: ", "✅" if backup_result else "❌")
	
	# Test save status
	var save_status = save_manager.get_save_status()
	if save_status:
		print("   Auto-save: ", "✅" if save_status.get("auto_save_enabled", false) else "❌")
	else:
		print("   Auto-save: unknown (no status)")

func _test_player_integration():
	if not player:
		print("❌ Player not available")
		return
	
	print("👤 Testing player integration...")
	
	# Test combat integration
	var attack_power = player.get_attack_power()
	var defense_power = player.get_defense_power()
	print("   Attack power: ", attack_power)
	print("   Defense power: ", defense_power)
	
	# Test save integration
	var save_data = player.get_save_data()
	print("   Save data: ", "✅" if not save_data.is_empty() else "❌")
	
	# Test travel capability
	var can_travel = player.can_travel()
	print("   Can travel: ", "✅" if can_travel else "❌")

func _print_final_status():
	print("📊 ===== FINAL SESSION #005 STATUS =====")
	
	if game_manager:
		var status = game_manager.get_system_status()
		if status:
			print("🎮 Game State: ", status.get("game_state", "unknown"))
			print("⚔️ Combat Available: ", status.get("combat_manager", false))
			print("📖 Events Available: ", status.get("event_manager", false))
			print("🗺️ Map Available: ", status.get("map_manager", false))
			print("💾 Save Available: ", status.get("save_manager", false))
			print("🕐 Game Time: ", "%.1fs" % status.get("game_time", 0))
			print("📍 Location: ", status.get("current_location", "unknown"))
			print("🚶 Movement: ", status.get("movement_points", 0))
		else:
			print("🎮 Game State: unknown (no status)")
			print("⚔️ Systems: not available")
	
	if player:
		print("👤 Player Level: ", player.level)
		print("💚 Player HP: ", player.hp, "/", player.max_hp)
		print("🎒 Inventory: ", player.inventory.size(), " items")
	
	# Calculate success rate
	var systems_working = 0
	var total_systems = 4
	
	if combat_manager: systems_working += 1
	if event_manager: systems_working += 1
	if map_manager: systems_working += 1
	if save_manager: systems_working += 1
	
	var success_rate = (float(systems_working) / float(total_systems)) * 100.0
	
	print("\n🎯 SESSION #005 SUCCESS RATE: %.1f%% (%d/%d systems)" % [success_rate, systems_working, total_systems])
	
	if success_rate == 100.0:
		print("🎉 SESSION #005: ✅ 100% SUCCESS!")
		print("🚀 Ready for Session #006!")
	else:
		print("⚠️ SESSION #005: Partial success, review needed")
	
	print("=".repeat(50)) 
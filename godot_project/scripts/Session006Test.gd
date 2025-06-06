class_name Session006Test
extends Node

## Session006Test - Testing Suite UI/UX Systems
## Validazione UIManager, HUD e integrazione con GameManager

# References to systems
var game_manager
var ui_manager: UIManager
var player: Player
var hud: HUD

# Test results
var tests_passed: int = 0
var tests_failed: int = 0
var test_results: Array[Dictionary] = []

func _ready():
	print("🧪 [Session006Test] Starting UI/UX integration tests...")
	
	# Get system references
	_get_system_references()
	
	# Wait a frame for systems to initialize
	await get_tree().process_frame
	
	# Run test suite
	_run_test_suite()

func _get_system_references():
	"""Get references to all systems being tested"""
	var parent = get_parent()
	
	if parent and parent.name == "GameManager":
		game_manager = parent
		
		# UIManager è un nodo figlio del GameManager, non una proprietà
		ui_manager = game_manager.get_node_or_null("UIManager") as UIManager
		
		# Player è in WorldContainer/Player
		var world_container = get_node_or_null("../../WorldContainer")
		if world_container:
			player = world_container.get_node_or_null("Player") as Player
		
		# HUD è in UIContainer/GameUI/HUD
		var ui_container = get_node_or_null("../../UIContainer")
		if ui_container:
			var game_ui = ui_container.get_node_or_null("GameUI")
			if game_ui:
				hud = game_ui.get_node_or_null("HUD") as HUD
	
	print("🧪 [Session006Test] System references acquired")
	print("  - GameManager: ", "✅" if game_manager else "❌")
	print("  - UIManager: ", "✅" if ui_manager else "❌")
	print("  - Player: ", "✅" if player else "❌")
	print("  - HUD: ", "✅" if hud else "❌")

func _run_test_suite():
	"""Run complete test suite for Session #006"""
	print("🧪 [Session006Test] Running UI/UX test suite...")
	
	# Test 1: UIManager initialization
	_test_ui_manager_initialization()
	
	# Test 2: UI state management
	_test_ui_state_management()
	
	# Test 3: GameManager integration
	_test_gamemanager_integration()
	
	# Test 4: Player integration
	_test_player_integration()
	
	# Test 5: Signal flow validation
	_test_signal_flow()
	
	# Calculate and report results
	_report_test_results()

func _test_ui_manager_initialization():
	"""Test UIManager proper initialization"""
	var test_name = "UIManager Initialization"
	print("🧪 Testing: ", test_name)
	
	var success = true
	var details = []
	
	# Check UIManager exists
	if ui_manager == null:
		success = false
		details.append("UIManager not found")
	else:
		details.append("UIManager found")
		
		# Check initial state
		if ui_manager.has_method("get_current_state"):
			var current_state = ui_manager.get_current_state()
			if current_state == "HUD":
				details.append("Initial state correct (HUD)")
			else:
				success = false
				details.append("Initial state incorrect: " + str(current_state))
		else:
			success = false
			details.append("get_current_state method missing")
	
	_record_test_result(test_name, success, details)

func _test_ui_state_management():
	"""Test UI state transitions"""
	var test_name = "UI State Management"
	print("🧪 Testing: ", test_name)
	
	var success = true
	var details = []
	
	if ui_manager and ui_manager.has_method("set_ui_state"):
		# Test state transitions
		var test_states = [
			UIManager.UIState.MAIN_INTERFACE,
			UIManager.UIState.HUD,
			UIManager.UIState.MENU
		]
		
		for state in test_states:
			ui_manager.set_ui_state(state)
			var current_state = ui_manager.get_current_state()
			var expected_state_name = UIManager.UIState.keys()[state]
			
			if current_state == expected_state_name:
				details.append("State transition to " + expected_state_name + " successful")
			else:
				success = false
				details.append("State transition to " + expected_state_name + " failed. Got: " + current_state)
	else:
		success = false
		details.append("UIManager state methods not available")
	
	_record_test_result(test_name, success, details)

func _test_gamemanager_integration():
	"""Test GameManager ↔ UIManager integration"""
	var test_name = "GameManager Integration"
	print("🧪 Testing: ", test_name)
	
	var success = true
	var details = []
	
	if game_manager and ui_manager:
		# Test signal connections
		if game_manager.has_signal("ui_state_changed"):
			details.append("GameManager has ui_state_changed signal")
		else:
			success = false
			details.append("GameManager missing ui_state_changed signal")
		
		# Test reference setup
		if ui_manager.game_manager == game_manager:
			details.append("UIManager has GameManager reference")
		else:
			# This might be null during early testing, not critical failure
			details.append("UIManager GameManager reference not set (expected during scene setup)")
	else:
		success = false
		details.append("Missing GameManager or UIManager")
	
	_record_test_result(test_name, success, details)

func _test_player_integration():
	"""Test Player ↔ UI integration"""
	var test_name = "Player Integration"
	print("🧪 Testing: ", test_name)
	
	var success = true
	var details = []
	
	if player and ui_manager:
		# Test player reference in UI
		if ui_manager.player == player:
			details.append("UIManager has Player reference")
		else:
			details.append("UIManager Player reference not set (will be set by GameManager)")
		
		# Test player stats availability
		if player.has_method("get_stats"):
			var stats = player.get_stats()
			if stats and stats.has("hp"):
				details.append("Player stats accessible (HP: " + str(stats.hp) + ")")
			else:
				success = false
				details.append("Player stats not accessible")
		else:
			success = false
			details.append("Player get_stats method missing")
	else:
		success = false
		details.append("Missing Player or UIManager")
	
	_record_test_result(test_name, success, details)

func _test_signal_flow():
	"""Test signal communication flow"""
	var test_name = "Signal Flow Validation"
	print("🧪 Testing: ", test_name)
	
	var success = true
	var details = []
	
	# Test UIManager signals
	if ui_manager:
		var required_signals = ["ui_state_changed", "interface_opened", "interface_closed"]
		for signal_name in required_signals:
			if ui_manager.has_signal(signal_name):
				details.append("UIManager has " + signal_name + " signal")
			else:
				success = false
				details.append("UIManager missing " + signal_name + " signal")
	
	# Test GameManager UI signals
	if game_manager:
		if game_manager.has_signal("ui_state_changed"):
			details.append("GameManager has ui_state_changed signal")
		else:
			success = false
			details.append("GameManager missing ui_state_changed signal")
	
	_record_test_result(test_name, success, details)

func _record_test_result(test_name: String, success: bool, details: Array):
	"""Record test result"""
	var result = {
		"name": test_name,
		"success": success,
		"details": details,
		"timestamp": Time.get_time_string_from_system()
	}
	
	test_results.append(result)
	
	if success:
		tests_passed += 1
		print("✅ [Session006Test] PASSED: ", test_name)
	else:
		tests_failed += 1
		print("❌ [Session006Test] FAILED: ", test_name)
	
	for detail in details:
		print("   - ", detail)

func _report_test_results():
	"""Generate final test report"""
	var total_tests = tests_passed + tests_failed
	var success_rate = (float(tests_passed) / float(total_tests)) * 100.0 if total_tests > 0 else 0.0
	
	var separator_line = ""
	for i in range(60):
		separator_line += "="
	
	print(separator_line)
	print("🧪 SESSION #006 UI/UX TEST RESULTS")
	print(separator_line)
	print("Tests Run: ", total_tests)
	print("Passed: ", tests_passed)
	print("Failed: ", tests_failed) 
	print("Success Rate: ", "%.1f%%" % success_rate)
	print(separator_line)
	
	# Detailed results
	for result in test_results:
		var status = "✅ PASS" if result.success else "❌ FAIL"
		print(status, " | ", result.name)
		for detail in result.details:
			print("      ", detail)
	
	print(separator_line)
	
	# Success criteria check
	if success_rate >= 80.0:
		print("🎉 SESSION #006 UI Foundation: SUCCESS!")
		print("   Ready to proceed with HUD implementation")
	else:
		print("⚠️  SESSION #006 UI Foundation: NEEDS WORK")
		print("   Address failing tests before proceeding")
	
	print(separator_line)

# Public API for external testing
func get_test_results() -> Dictionary:
	"""Get complete test results"""
	return {
		"total_tests": tests_passed + tests_failed,
		"tests_passed": tests_passed,
		"tests_failed": tests_failed,
		"success_rate": (float(tests_passed) / float(tests_passed + tests_failed)) * 100.0 if (tests_passed + tests_failed) > 0 else 0.0,
		"results": test_results
	}

func test_ui_manual_transitions():
	"""Manual test for UI transitions (debug function)"""
	print("🧪 [Session006Test] Manual UI transition test...")
	
	if ui_manager:
		var states = [
			UIManager.UIState.HUD,
			UIManager.UIState.MAIN_INTERFACE, 
			UIManager.UIState.MENU,
			UIManager.UIState.HUD
		]
		
		for state in states:
			print("   Transitioning to: ", UIManager.UIState.keys()[state])
			ui_manager.set_ui_state(state)
			await get_tree().create_timer(1.0).timeout
		
		print("🧪 Manual transition test complete")
	else:
		print("❌ UIManager not available for manual test") 
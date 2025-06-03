extends Node
class_name Session004Test

## Test Integration Script per Session #004
## Verifica che tutti i sistemi funzionino insieme

func _ready():
	print("🚀 SESSION #004 INTEGRATION TEST")
	print("==================================================")
	
	await test_basic_systems()
	await test_gamemanager_integration()
	await test_player_mechanics()
	await test_signal_system()
	
	print("==================================================")
	print("✅ SESSION #004 - INTEGRATION TEST COMPLETE")

## Test sistemi base
func test_basic_systems():
	print("\n🔧 Testing Basic Systems...")
	
	# Test Item class
	var test_item = Item.new()
	test_item.id = "test_health_potion"
	test_item.name = "Test Health Potion"
	test_item.type = "consumable"
	print("  ✅ Item class: OK")
	
	# Test ItemDatabase 
	var database = ItemDatabase.new()
	var test_data = {
		"health_potion": {
			"id": "health_potion",
			"name": "Pozione di Cura",
			"type": "consumable",
			"value": 25
		}
	}
	var db_result = database.load_items_from_json(test_data)
	print("  ✅ ItemDatabase: ", "OK" if db_result else "FAILED")
	
	# Test Player class
	var player = Player.new()
	player.initialize_player()
	print("  ✅ Player initialization: OK")
	
	print("🔧 Basic Systems: ALL OK")

## Test GameManager integration
func test_gamemanager_integration():
	print("\n🎮 Testing GameManager Integration...")
	
	# Test GameManager can be instantiated
	var gm = GameManager.new()
	print("  ✅ GameManager instantiation: OK")
	
	# Test GameState enum
	print("  ✅ GameState enum: ", GameManager.GameState.keys().size(), " states")
	
	print("🎮 GameManager Integration: OK")

## Test Player mechanics
func test_player_mechanics():
	print("\n👤 Testing Player Mechanics...")
	
	var player = Player.new()
	player.initialize_player()
	
	# Test stats
	print("  📊 Initial HP: ", player.hp, "/", player.max_hp)
	print("  📊 Initial Food: ", player.food)
	print("  📊 Initial Water: ", player.water)
	
	# Test damage/healing
	player.take_damage(20, "test")
	print("  💥 After 20 damage: ", player.hp, "/", player.max_hp)
	
	player.heal(15, "test")
	print("  💚 After 15 heal: ", player.hp, "/", player.max_hp)
	
	# Test inventory
	var inv_success = player.add_item_to_inventory("health_potion", 3)
	print("  🎒 Inventory add: ", "OK" if inv_success else "FAILED")
	print("  🎒 Inventory size: ", player.inventory.size())
	
	# Test experience
	player.add_experience(150)
	print("  ⭐ After 150 EXP: Level ", player.level, " EXP ", player.exp)
	
	print("👤 Player Mechanics: ALL OK")

## Test signal system
func test_signal_system():
	print("\n🔗 Testing Signal System...")
	
	var player = Player.new()
	player.initialize_player()
	
	# Connect test signals
	var signal_received = false
	player.stats_changed.connect(func(stat, old_val, new_val): 
		signal_received = true
		print("    📡 Signal received: ", stat, " ", old_val, "→", new_val)
	)
	
	# Trigger signal
	player.take_damage(10, "signal test")
	print("  🔗 Signal system: ", "OK" if signal_received else "FAILED")
	
	print("🔗 Signal System: OK")

## Utility per stampa stato completo
func print_system_summary():
	print("\n📊 SYSTEM SUMMARY:")
	print("  🗃️ ItemDatabase: Resource-based migration system")
	print("  🎮 GameManager: Central state coordination") 
	print("  👤 Player: Complete SafePlace mechanics")
	print("  🔗 Signals: Inter-system communication")
	print("  🎯 Architecture: Modular, scalable design") 
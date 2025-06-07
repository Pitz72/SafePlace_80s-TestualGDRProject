extends Node

# ✅ SYSTEM CHECK TEST - CLEAN VERSION
# Verifica che tutti i sistemi SafePlace funzionino senza errori di path

func _ready():
	print("🔍 SYSTEM CHECK TEST - Starting...")
	await get_tree().process_frame

	test_all_systems()

func test_all_systems():
	print("\n🧪 TESTING ALL SYSTEMS:")

	# Test 1: Item Database
	test_item_database()

	# Test 2: Player System
	test_player_system()

	# Test 3: Equipment Bonus
	test_equipment_bonus()

	print("\n✅ SYSTEM CHECK COMPLETED!")

func test_item_database():
	print("\n📦 Testing ItemDatabase...")

	var item_db = ItemDatabase.new()
	if item_db.load_items_from_js():
		var count = item_db.get_all_items().size()
		print("✅ ItemDatabase: %d items loaded successfully" % count)
	else:
		print("❌ ItemDatabase: Failed to load items")

func test_player_system():
	print("\n👤 Testing Player System...")

	var player = Player.new()
	player.name = "TestPlayer"
	player.vig = 15
	player.pot = 12
	player.agi = 14
	player.pre = 10

	print("✅ Player: Basic stats initialized")
	print("   VIG: %d, POT: %d, AGI: %d, PRE: %d" % [player.vig, player.pot, player.agi, player.pre])

func test_equipment_bonus():
	print("\n⚔️ Testing Equipment Bonus System...")

	# Create test player with equipment
	var player = Player.new()

	# Test equipment bonus calculation (should not crash)
	var attack_bonus = player.get_equipment_bonus("attack")
	var defense_bonus = player.get_equipment_bonus("defense")

	print("✅ Equipment Bonus System: Working")
	print("   Attack Bonus: %d, Defense Bonus: %d" % [attack_bonus, defense_bonus])

# Cleanup function
func _exit_tree():
	print("🔄 System Check Test completed, cleaning up...")

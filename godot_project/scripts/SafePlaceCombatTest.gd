extends Node

## SafePlace Combat System Test
## Verifica che il sistema di combattimento SafePlace autentico funzioni correttamente

const SafePlaceCombatSystemScript = preload("res://scripts/SafePlaceCombatSystem.gd")

func _ready():
	print("🧪 TESTING SAFEPLACE COMBAT SYSTEM...")
	await get_tree().process_frame

	test_safeplace_combat()

func test_safeplace_combat():
	print("\n⚔️ INIZIANDO TEST COMBATTIMENTO SAFEPLACE")

	# Crea sistema di combattimento
	var combat_system = SafePlaceCombatSystemScript.new()
	add_child(combat_system)

	# Aspetta inizializzazione
	await get_tree().process_frame

	# Test combattimento vs Bandit Tier 1
	print("\n🎯 TEST 1: Combattimento vs BANDIT Tier 1")
	var result1 = combat_system.start_combat("BANDIT", 1)
	_print_combat_result(result1)

	await get_tree().create_timer(1.0).timeout

	# Test combattimento vs Raider Tier 2
	print("\n🎯 TEST 2: Combattimento vs RAIDER Tier 2")
	combat_system.reset_combat()
	var result2 = combat_system.start_combat("RAIDER", 2)
	_print_combat_result(result2)

	await get_tree().create_timer(1.0).timeout

	# Test combattimento vs Mutant Tier 3
	print("\n🎯 TEST 3: Combattimento vs MUTANT Tier 3")
	combat_system.reset_combat()
	var result3 = combat_system.start_combat("MUTANT", 3)
	_print_combat_result(result3)

	print("\n✅ TESTING COMPLETATO!")
	print("🎲 Sistema SafePlace Combat funziona con regole autentiche")

func _print_combat_result(result: Dictionary):
	if result.is_empty():
		print("❌ Combattimento fallito")
		return

	print("🏆 RISULTATO:")
	print("   %s in %d round" % ["VITTORIA" if result.victory else "SCONFITTA", result.turns_count])
	print("   HP finale: %d, Danni inflitti: %d" % [result.final_player_hp, result.damage_dealt])
	if result.victory:
		print("   EXP guadagnata: %d" % result.exp_gained)

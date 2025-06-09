extends Node

## Test rapido sistema START → END per verificare la correzione

func _ready():
	print("🧪 === TEST SISTEMA START → END ===")
	_test_start_end_system()

func _test_start_end_system():
	print("🔧 Test generazione mappa con sistema S→E...")

	# Crea generatore mappa
	var map_generator = ASCIIMapGenerator.new()

	# Verifica posizioni
	var start_pos = map_generator.get_start_position()
	var end_pos = map_generator.get_end_position()
	var player_pos = map_generator.get_player_position()

	print("📍 START (S): (%d, %d) - Dovrebbe essere NORD-OVEST (0-40, 0-40)" % [start_pos.x, start_pos.y])
	print("🎯 END (E): (%d, %d) - Dovrebbe essere SUD-EST (210-245, 210-245)" % [end_pos.x, end_pos.y])
	print("👤 PLAYER: (%d, %d) - Dovrebbe coincidere con START" % [player_pos.x, player_pos.y])

	# Verifica posizionamento corretto
	var start_ok = start_pos.x >= 5 and start_pos.x <= 40 and start_pos.y >= 5 and start_pos.y <= 40
	var end_ok = end_pos.x >= 210 and end_pos.x <= 245 and end_pos.y >= 210 and end_pos.y <= 245
	var player_ok = player_pos == start_pos

	print("\n✅ RISULTATI TEST:")
	print("   START posizionato correttamente (NW): %s" % ("✅" if start_ok else "❌"))
	print("   END posizionato correttamente (SE): %s" % ("✅" if end_ok else "❌"))
	print("   PLAYER parte da START: %s" % ("✅" if player_ok else "❌"))

	# Test lampeggio
	map_generator.update_blink_timer(0.6)
	var is_blinking = map_generator.is_blinking()
	print("   Sistema lampeggio attivo: %s" % ("✅" if is_blinking else "❌"))

	# Test raggiungimento destinazione
	var reached = map_generator.has_reached_destination()
	print("   Check destinazione funziona: %s" % ("✅" if not reached else "❌"))

	if start_ok and end_ok and player_ok:
		print("\n🎉 SISTEMA START→END FUNZIONA CORRETTAMENTE!")
		print("🎮 Obiettivo: Muovere @ dalla S (Nord-Ovest) alla E (Sud-Est)")
	else:
		print("\n⚠️ PROBLEMI RILEVATI - Verificare implementazione")

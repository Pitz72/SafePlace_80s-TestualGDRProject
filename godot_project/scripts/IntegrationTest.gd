extends Node

## Test integrazione completa ItemDatabase + LoreManager v1.2.0
## Verifica che il sistema lore sia integrato automaticamente

func _ready():
	print("🔧 === TEST INTEGRAZIONE ITEMDATABASE + LORE ===")
	_test_complete_integration()

func _test_complete_integration():
	print("🔄 Test integrazione completa ItemDatabase + LoreManager...")

	# Test 1: Caricamento ItemDatabase con auto-enhancement
	print("\n1️⃣ TEST: Caricamento ItemDatabase con Lore auto-enhancement")
	var item_database = ItemDatabase.new()
	var load_success = item_database.load_complete_database()

	if not load_success:
		print("❌ FALLITO: ItemDatabase load_complete_database()")
		return

	print("✅ ItemDatabase caricato con successo")

	# Test 2: Verifica oggetti caricati
	print("\n2️⃣ TEST: Verifica oggetti caricati")
	var total_items = item_database.get_total_items_count()
	print("📊 Oggetti caricati: ", total_items)

	if total_items == 0:
		print("❌ FALLITO: Nessun oggetto caricato")
		return

	print("✅ Oggetti caricati correttamente")

	# Test 3: Verifica lore enhancement applicato
	print("\n3️⃣ TEST: Verifica lore enhancement applicato")
	var enhanced_items = 0
	var legendary_items = 0
	var rare_items = 0

	for i in range(min(10, total_items)): # Test primi 10 oggetti
		var item = item_database.get_item_by_index(i)
		if item.has_lore():
			enhanced_items += 1
			if item.rarity == "legendary":
				legendary_items += 1
			elif item.rarity == "rare":
				rare_items += 1

	print("🏺 Oggetti con lore: ", enhanced_items, "/10")
	print("🏆 Oggetti legendary: ", legendary_items)
	print("💎 Oggetti rare: ", rare_items)

	if enhanced_items == 0:
		print("⚠️ WARNING: Nessun oggetto enhanced - possibile problema lore")
	else:
		print("✅ Lore enhancement applicato correttamente")

	# Test 4: Verifica oggetti specifici
	print("\n4️⃣ TEST: Verifica oggetti specifici con lore")
	_test_specific_lore_items(item_database)

	# Test 5: Performance check
	print("\n5️⃣ TEST: Performance check")
	var start_time = Time.get_ticks_msec()
	for i in range(100): # 100 operazioni
		var item = item_database.get_item_by_index(i % total_items)
		var has_lore = item.has_lore()
		var rarity_color = item.get_rarity_color()
	var end_time = Time.get_ticks_msec()

	var perf_time = end_time - start_time
	print("⚡ 100 operazioni lore in: ", perf_time, "ms")

	if perf_time > 100:
		print("⚠️ WARNING: Performance sotto target (>100ms)")
	else:
		print("✅ Performance ottimale")

	# RISULTATO FINALE
	print("\n🎊 === RISULTATO INTEGRAZIONE ===")
	if load_success and total_items > 0 and enhanced_items > 0:
		print("🎉 INTEGRAZIONE COMPLETATA CON SUCCESSO!")
		print("📊 ItemDatabase + LoreManager funzionano insieme")
		print("🎮 SafePlace v1.2.0 READY FOR GAMEPLAY!")
	else:
		print("❌ INTEGRAZIONE FALLITA - Controllare implementazione")

func _test_specific_lore_items(item_database: ItemDatabase):
	# Test oggetti specifici che dovrebbero avere lore
	var test_items = ["carillon_lena", "registrazione_marcus", "mappa_chiave"]

	for item_id in test_items:
		var item = item_database.get_item_by_id(item_id)
		if item:
			print("🔍 " + item_id + ":")
			print("   Lore: " + ("✅" if item.has_lore() else "❌"))
			print("   Rarity: " + item.rarity)
			print("   Special: " + ("✅" if item.is_special() else "❌"))
			if item.has_lore():
				print("   Text: " + item.lore_text.substr(0, 50) + "...")
		else:
			print("⚠️ Item non trovato: " + item_id)

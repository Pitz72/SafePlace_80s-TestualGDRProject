extends SceneTree

# MapAnalyzer.gd - Utility di debug per analizzare e "sanificare" il file mappa ASCII.
# Uso (headless):
#   godot --headless --script res://scripts/tools/MapAnalyzer.gd
#
# Stampa:
#   • Numero righe
#   • Lunghezza max/min prima e dopo sanificazione
#   • Righe che eccedono la larghezza TARGET_WIDTH
#   • Crea file sanificato res://mappa_ascii_gdr_clean.txt se necessario

const SOURCE_PATH := "res://mappa_ascii_gdr.txt"
const OUTPUT_PATH := "res://mappa_ascii_gdr_clean.txt"
const TARGET_WIDTH := 250

func _initialize():
	print("[MapAnalyzer] Avviato – analisi di %s" % SOURCE_PATH)
	var file := FileAccess.open(SOURCE_PATH, FileAccess.READ)
	if file == null:
		push_error("[MapAnalyzer] Impossibile aprire il file sorgente!")
		quit()
		return

	var lines: Array[String] = []
	var max_len_before := 0
	var min_len_before := 999999
	while not file.eof_reached():
		var line := file.get_line()
		# Conserva anche righe vuote (importante per mappa)
		lines.append(line)
		max_len_before = max(max_len_before, line.length())
		min_len_before = min(min_len_before, line.length())
	file.close()

	var trimmed_lines: Array[String] = []
	var trimmed_count := 0
	var max_len_after := 0
	var min_len_after := 999999

	for l in lines:
		# Rimuove CR e spazi/tabs a destra
		var clean := l.rstrip(" \t\r")
		if clean.length() > TARGET_WIDTH:
			clean = clean.substr(0, TARGET_WIDTH)
			trimmed_count += 1
		trimmed_lines.append(clean)
		max_len_after = max(max_len_after, clean.length())
		min_len_after = min(min_len_after, clean.length())

	print("[MapAnalyzer] Righe totali           : %d" % lines.size())
	print("[MapAnalyzer] Lunghezza min/max prima : %d / %d" % [min_len_before, max_len_before])
	print("[MapAnalyzer] Lunghezza min/max dopo  : %d / %d" % [min_len_after, max_len_after])
	print("[MapAnalyzer] Righe tagliate (> %d)  : %d" % [TARGET_WIDTH, trimmed_count])

	# Se qualcosa è stato modificato, scrive file output
	if trimmed_count > 0 or max_len_before != max_len_after:
		var out := FileAccess.open(OUTPUT_PATH, FileAccess.WRITE)
		if out:
			for idx in range(trimmed_lines.size()):
				out.store_line(trimmed_lines[idx])
			out.close()
			print("[MapAnalyzer] File sanificato scritto in %s" % OUTPUT_PATH)
		else:
			push_error("[MapAnalyzer] Impossibile scrivere il file di output!")
	else:
		print("[MapAnalyzer] Nessuna sanificazione necessaria – lunghezze già corrette.")

	print("[MapAnalyzer] Completato.")
	quit() 

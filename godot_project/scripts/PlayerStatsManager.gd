# PlayerStatsManager.gd
# Singleton per la gestione di tutte le statistiche, abilità, esperienza
# e progressione del giocatore.

extends Node

# Segnale emesso quando i punti statistica disponibili cambiano.
signal stat_points_changed(new_amount)
# Segnale emesso quando l'esperienza cambia.
signal experience_changed(new_amount)
# Segnale emesso quando una statistica viene migliorata.
signal stat_improved(stat_name, new_value)

# --- STATISTICHE DI BASE ---
# Ispirate a D&D, con un valore massimo di 18.
var stats = {
	"strength": 5,
	"dexterity": 5,
	"constitution": 5,
	"intelligence": 5,
	"wisdom": 5,
	"charisma": 5
}
const MAX_STAT_VALUE = 18

# --- PROGRESSIONE ---
var experience: int = 0
var available_stat_points: int = 0
const EXP_PER_STAT_POINT = 100 # Modificato da 10 a 100 per un gioco più lungo

# --- STATISTICHE DERIVATE ---
# Alias per compatibilità con il sistema di eventi originale.
var stat_aliases = {
	"forza": "strength",
	"destrezza": "dexterity",
	"costituzione": "constitution",
	"intelligenza": "intelligence",
	"saggezza": "wisdom",
	"carisma": "charisma",
	"vigor": "constitution" # Alias comune
}
var max_hp: int = 0


func _ready():
	print("👤 PlayerStatsManager: Inizializzazione...")
	_recalculate_derived_stats()

# --- API Pubblica ---

func award_experience(amount: int, reason: String = "azione"):
	"""
	Aggiunge esperienza al giocatore e la converte in punti statistica se necessario.
	"""
	experience += amount
	experience_changed.emit(experience)
	print("✨ PlayerStatsManager: +%d EXP per %s. Totale: %d" % [amount, reason, experience])

	# Controlla se sono stati guadagnati nuovi punti statistica
	while experience >= EXP_PER_STAT_POINT:
		experience -= EXP_PER_STAT_POINT
		available_stat_points += 1
		stat_points_changed.emit(available_stat_points)
		print("⭐ PlayerStatsManager: Nuovo punto statistica ottenuto! Disponibili: %d" % available_stat_points)

func improve_stat(stat_name: String) -> bool:
	"""
	Tenta di migliorare una statistica usando un punto disponibile.
	Restituisce true in caso di successo.
	"""
	var s_name = stat_name.to_lower()
	if stat_aliases.has(s_name):
		s_name = stat_aliases[s_name]

	if not stats.has(s_name):
		printerr("❌ PlayerStatsManager: Tentativo di migliorare una statistica inesistente: %s" % s_name)
		return false

	if available_stat_points <= 0:
		print("⚠️ PlayerStatsManager: Nessun punto statistica disponibile per migliorare %s." % s_name)
		return false

	if stats[s_name] >= MAX_STAT_VALUE:
		print("⚠️ PlayerStatsManager: La statistica %s è già al massimo." % s_name)
		return false

	available_stat_points -= 1
	stats[s_name] += 1

	_recalculate_derived_stats()

	stat_points_changed.emit(available_stat_points)
	stat_improved.emit(s_name, stats[s_name])

	print("🚀 PlayerStatsManager: %s migliorata a %d!" % [s_name.capitalize(), stats[s_name]])
	return true

func check_skill(stat_name: String, difficulty: int) -> bool:
	"""
	Esegue un "tiro" su una statistica, simulando un D20.
	Restituisce true se il tiro supera la difficoltà.
	"""
	var s_name = stat_name.to_lower()
	if stat_aliases.has(s_name):
		s_name = stat_aliases[s_name]

	if not stats.has(s_name):
		printerr("❌ PlayerStatsManager: Skill check su statistica inesistente: %s" % s_name)
		return false

	var stat_value = stats[s_name]
	# Formula semplice: tiro D20 + modificatore di caratteristica
	var modifier = int((stat_value - 10) / 2)
	var roll = randi_range(1, 20)
	var result = roll + modifier

	print("🎲 PlayerStatsManager: Skill check per %s (diff: %d). Tiro: %d (%d + %d mod) -> %s" % [s_name, difficulty, result, roll, modifier, "SUCCESSO" if result >= difficulty else "FALLITO"])

	if result >= difficulty:
		award_experience(3, "skill check riuscito")
		return true
	else:
		return false

func get_stat(stat_name: String) -> int:
	"""Restituisce il valore di una statistica, anche tramite alias."""
	var s_name = stat_name.to_lower()
	if stat_aliases.has(s_name):
		s_name = stat_aliases[s_name]

	if stats.has(s_name):
		return stats[s_name]

	return 0

# --- Funzioni Private ---

func _recalculate_derived_stats():
	"""
	Ricalcola le statistiche derivate come i Punti Vita massimi.
	"""
	var old_max_hp = max_hp
	var constitution = stats["constitution"]
	# Formula di esempio: 10 HP base + (Costituzione * 2)
	max_hp = 10 + (constitution * 2)

	if old_max_hp != max_hp:
		print("❤️ PlayerStatsManager: HP massimi aggiornati a %d" % max_hp)
		# Qui si potrebbe emettere un segnale per aggiornare l'HP attuale del giocatore
		# Esempio: hp_changed.emit(get_current_hp(), max_hp)

# --- Funzioni per il Salvataggio/Caricamento ---

func get_save_data() -> Dictionary:
	"""Restituisce i dati da salvare."""
	return {
		"stats": stats,
		"experience": experience,
		"available_stat_points": available_stat_points
	}

func load_save_data(data: Dictionary):
	"""Carica i dati da un salvataggio."""
	if data.has("stats"):
		stats = data["stats"]
	if data.has("experience"):
		experience = data["experience"]
	if data.has("available_stat_points"):
		available_stat_points = data["available_stat_points"]

	_recalculate_derived_stats()
	print("💾 PlayerStatsManager: Dati giocatore caricati.")

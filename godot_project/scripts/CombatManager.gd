extends Node
class_name CombatManager

## CombatManager per SafePlace
## Gestisce combattimento turn-based con armi/armature da ItemDatabase

signal combat_started(enemy_data: Dictionary)
signal combat_ended(result: String, rewards: Dictionary)
signal turn_changed(is_player_turn: bool)
signal damage_dealt(target: String, damage: int, source: String)
signal experience_gained(amount: int)

## Stati del combattimento
enum CombatState {
	INACTIVE,
	INITIALIZING,
	PLAYER_TURN,
	ENEMY_TURN,
	VICTORY,
	DEFEAT,
	FLED
}

## Azioni disponibili
enum CombatAction {
	ATTACK,
	DEFEND,
	USE_ITEM,
	FLEE
}

@export var current_state: CombatState = CombatState.INACTIVE
@export var debug_mode: bool = false

# Riferimenti ai sistemi
var game_manager: GameManager
var player: Player
var item_database: ItemDatabase

# Dati del combattimento corrente
var current_enemy: Dictionary = {}
var turn_count: int = 0
var player_defending: bool = false
var combat_log: Array[String] = []

# Statistiche combattimento
var total_damage_dealt: int = 0
var total_damage_received: int = 0
var combats_won: int = 0
var combats_lost: int = 0

func _ready():
	print("⚔️ CombatManager inizializzato")
	_initialize_combat_system()

## Inizializza il sistema di combattimento
func _initialize_combat_system():
	# Trova i riferimenti ai sistemi principali
	game_manager = get_node("../GameManager") if get_node_or_null("../GameManager") else null
	player = get_node("../../WorldContainer/Player") if get_node_or_null("../../WorldContainer/Player") else null
	
	if game_manager and game_manager.has_method("get_item_database"):
		item_database = game_manager.get_item_database()
	
	# Connetti segnali
	if game_manager:
		game_manager.game_state_changed.connect(_on_game_state_changed)
	
	if player:
		player.stats_changed.connect(_on_player_stats_changed)
	
	print("⚔️ Sistema combattimento collegato ai sistemi principali")

## Avvia combattimento con nemico
func start_combat(enemy_data: Dictionary) -> bool:
	if current_state != CombatState.INACTIVE:
		print("❌ Combattimento già in corso!")
		return false
	
	if not player:
		print("❌ Player non trovato!")
		return false
	
	print("⚔️ Iniziando combattimento contro: ", enemy_data.get("name", "Nemico sconosciuto"))
	
	# Setup dati nemico
	current_enemy = enemy_data.duplicate()
	if not current_enemy.has("hp"):
		current_enemy["hp"] = current_enemy.get("max_hp", 100)
	
	# Reset stato combattimento  
	turn_count = 0
	player_defending = false
	combat_log.clear()
	total_damage_dealt = 0
	total_damage_received = 0
	
	# Cambia stato
	current_state = CombatState.INITIALIZING
	
	# Notifica inizio combattimento
	combat_started.emit(current_enemy)
	
	# Aggiorna GameManager se disponibile
	if game_manager:
		game_manager.change_state("COMBAT")
	
	# Inizia il primo turno
	_start_player_turn()
	
	_add_to_log("Combattimento iniziato contro " + current_enemy.get("name", "Nemico"))
	
	return true

## Inizia turno del giocatore
func _start_player_turn():
	current_state = CombatState.PLAYER_TURN
	turn_count += 1
	player_defending = false
	
	turn_changed.emit(true)
	_add_to_log("--- Turno " + str(turn_count) + " del Giocatore ---")
	
	if debug_mode:
		print("🎮 Turno del giocatore #", turn_count)

## Esegue azione del giocatore
func player_action(action: CombatAction, _target: String = "", item_id: String = "") -> bool:
	if current_state != CombatState.PLAYER_TURN:
		print("❌ Non è il turno del giocatore!")
		return false
	
	var action_successful = false
	
	match action:
		CombatAction.ATTACK:
			action_successful = _player_attack()
		CombatAction.DEFEND:
			action_successful = _player_defend()
		CombatAction.USE_ITEM:
			action_successful = _player_use_item(item_id)
		CombatAction.FLEE:
			action_successful = _player_flee()
	
	if action_successful:
		# Controlla se il nemico è morto
		if current_enemy.get("hp", 0) <= 0:
			_end_combat(CombatState.VICTORY)
		else:
			# Turno del nemico
			_start_enemy_turn()
	
	return action_successful

## Attacco del giocatore
func _player_attack() -> bool:
	if not player:
		return false
	
	# Calcola danno base dal player
	var base_damage = player.get_attack_power()
	
	# Bonus da arma equipaggiata
	var weapon_bonus = _get_weapon_damage_bonus()
	var total_damage = base_damage + weapon_bonus
	
	# Calcolo critico (5% chance)
	var is_critical = randf() < 0.05
	if is_critical:
		total_damage = int(total_damage * 1.5)
		_add_to_log("🎯 COLPO CRITICO!")
	
	# Applica danno al nemico
	current_enemy["hp"] = max(0, current_enemy.get("hp", 0) - total_damage)
	total_damage_dealt += total_damage
	
	# Log e segnali
	var weapon_name = _get_equipped_weapon_name()
	var attack_desc = "Attacchi con " + weapon_name + " per " + str(total_damage) + " danni"
	if is_critical:
		attack_desc += " (CRITICO!)"
	
	_add_to_log(attack_desc)
	damage_dealt.emit("enemy", total_damage, "player_attack")
	
	if debug_mode:
		print("⚔️ Player attacca per ", total_damage, " danni. Nemico HP: ", current_enemy.get("hp", 0))
	
	return true

## Difesa del giocatore  
func _player_defend() -> bool:
	player_defending = true
	_add_to_log("🛡️ Ti metti in difesa per il prossimo attacco")
	
	if debug_mode:
		print("🛡️ Player si difende")
	
	return true

## Uso oggetto del giocatore
func _player_use_item(item_id: String) -> bool:
	if not player or not item_database:
		return false
	
	if item_id.is_empty():
		_add_to_log("❌ Nessun oggetto selezionato")
		return false
	
	# Verifica se il player ha l'oggetto
	if not player.has_item_in_inventory(item_id):
		_add_to_log("❌ Non hai questo oggetto nell'inventario")
		return false
	
	# Ottieni dati oggetto
	var item = item_database.get_item(item_id)
	if not item:
		_add_to_log("❌ Oggetto non riconosciuto")
		return false
	
	# Usa l'oggetto
	var use_successful = player.use_item(item_id)
	if use_successful:
		_add_to_log("💊 Usi " + item.name)
		return true
	else:
		_add_to_log("❌ Non puoi usare " + item.name + " ora")
		return false

## Fuga del giocatore
func _player_flee() -> bool:
	# Possibilità di fuga basata su agilità
	var flee_chance = 0.7 + (player.agi * 0.01) if player else 0.7
	flee_chance = min(flee_chance, 0.95)  # Max 95%
	
	if randf() < flee_chance:
		_add_to_log("🏃 Sei riuscito a fuggire!")
		_end_combat(CombatState.FLED)
		return true
	else:
		_add_to_log("❌ Non riesci a fuggire!")
		return true  # L'azione è valida anche se fallisce

## Inizia turno del nemico
func _start_enemy_turn():
	current_state = CombatState.ENEMY_TURN
	turn_changed.emit(false)
	
	if debug_mode:
		print("👹 Turno del nemico")
	
	# Pausa breve per l'esperienza utente
	await get_tree().create_timer(1.0).timeout
	
	# Azione del nemico (attacco semplice)
	_enemy_attack()
	
	# Controlla se il player è morto
	if player and player.hp <= 0:
		_end_combat(CombatState.DEFEAT)
	else:
		# Torna al turno del player
		_start_player_turn()

## Attacco del nemico
func _enemy_attack():
	if not player:
		return
	
	var enemy_damage = current_enemy.get("attack", 10)
	
	# Riduzione danno se il player si difende
	if player_defending:
		enemy_damage = int(enemy_damage * 0.5)
		_add_to_log("🛡️ La tua difesa riduce il danno!")
	
	# Bonus da armatura
	var armor_reduction = _get_armor_damage_reduction()
	enemy_damage = max(1, enemy_damage - armor_reduction)
	
	# Applica danno al player
	player.take_damage(enemy_damage, "enemy_attack")
	total_damage_received += enemy_damage
	
	# Log
	var enemy_name = current_enemy.get("name", "Il nemico")
	_add_to_log(enemy_name + " ti attacca per " + str(enemy_damage) + " danni")
	
	damage_dealt.emit("player", enemy_damage, "enemy_attack")
	
	if debug_mode:
		print("👹 Nemico attacca per ", enemy_damage, " danni. Player HP: ", player.hp)

## Termina combattimento
func _end_combat(result: CombatState):
	current_state = result
	
	var result_text = ""
	var rewards = {}
	
	match result:
		CombatState.VICTORY:
			result_text = "victory"
			combats_won += 1
			rewards = _calculate_victory_rewards()
			_add_to_log("🏆 Hai vinto il combattimento!")
			
		CombatState.DEFEAT:
			result_text = "defeat"
			combats_lost += 1
			_add_to_log("💀 Sei stato sconfitto...")
			
		CombatState.FLED:
			result_text = "fled"
			_add_to_log("🏃 Sei fuggito dal combattimento")
	
	# Applica ricompense
	if rewards.has("experience") and player:
		player.add_experience(rewards["experience"])
		experience_gained.emit(rewards["experience"])
	
	# Segnali
	combat_ended.emit(result_text, rewards)
	
	# Reset stato
	current_state = CombatState.INACTIVE
	current_enemy.clear()
	
	# Ritorna al GameManager
	if game_manager:
		game_manager.change_state("PLAYING")
	
	if debug_mode:
		print("⚔️ Combattimento terminato: ", result_text)

## Calcola ricompense vittoria
func _calculate_victory_rewards() -> Dictionary:
	var rewards = {}
	
	# Esperienza base
	var base_exp = current_enemy.get("experience", 10)
	
	# Bonus per efficienza (meno turni = più EXP)
	var efficiency_bonus = max(0, 10 - turn_count)
	
	rewards["experience"] = base_exp + efficiency_bonus
	
	# Eventuale oro/oggetti (da implementare)
	if current_enemy.has("gold"):
		rewards["gold"] = current_enemy["gold"]
	
	return rewards

## Ottiene bonus danno da arma equipaggiata
func _get_weapon_damage_bonus() -> int:
	if not player or not item_database:
		return 0
	
	var equipped_weapon = player.get_equipped_weapon()
	if not equipped_weapon:
		return 0
	
	return equipped_weapon.get("damage", 0)

## Ottiene nome arma equipaggiata
func _get_equipped_weapon_name() -> String:
	if not player:
		return "pugni"
	
	var equipped_weapon = player.get_equipped_weapon()
	if not equipped_weapon:
		return "pugni"
	
	return equipped_weapon.get("name", "arma sconosciuta")

## Ottiene riduzione danno da armatura
func _get_armor_damage_reduction() -> int:
	if not player or not item_database:
		return 0
	
	var equipped_armor = player.get_equipped_armor()
	if not equipped_armor:
		return 0
	
	return equipped_armor.get("defense", 0)

## Aggiunge messaggio al log di combattimento
func _add_to_log(message: String):
	combat_log.append(message)
	print("⚔️ ", message)
	
	# Mantieni solo gli ultimi 50 messaggi
	if combat_log.size() > 50:
		combat_log.pop_front()

## Signal handlers
func _on_game_state_changed(new_state):
	# new_state è GameManager.GameState enum, non string
	if new_state != GameManager.GameState.COMBAT and current_state != CombatState.INACTIVE:
		# Combattimento interrotto
		_end_combat(CombatState.FLED)

func _on_player_stats_changed(_stat: String, _old_val: int, new_val: int):
	if new_val <= 0 and current_state != CombatState.INACTIVE:
		# Player morto durante combattimento
		_end_combat(CombatState.DEFEAT)

## Utility per testing
func debug_start_test_combat():
	var test_enemy = {
		"name": "Bandito",
		"max_hp": 50,
		"hp": 50,
		"attack": 8,
		"defense": 2,
		"experience": 15,
		"gold": 5
	}
	
	start_combat(test_enemy)

## Ottiene stato attuale per debugging
func get_combat_status() -> Dictionary:
	return {
		"state": CombatState.keys()[current_state],
		"enemy": current_enemy,
		"turn_count": turn_count,
		"player_defending": player_defending,
		"damage_dealt": total_damage_dealt,
		"damage_received": total_damage_received,
		"log_entries": combat_log.size()
	} 
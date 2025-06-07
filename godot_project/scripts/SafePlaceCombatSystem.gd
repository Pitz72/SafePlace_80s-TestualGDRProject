class_name SafePlaceCombatSystem
extends Node

## SafePlace Combat System - Regole Autentiche
## Implementazione fedele del sistema originale SafePlace con regole specifiche

signal combat_started(player_data: Dictionary, enemy_data: Dictionary)
signal combat_round_completed(round_data: Dictionary)
signal combat_ended(result: Dictionary)

# Combat States
enum CombatState {
	INACTIVE,
	PREPARING,
	PLAYER_TURN,
	ENEMY_TURN,
	RESOLVING,
	COMPLETED
}

# Combat Actions
enum CombatAction {
	ATTACK,
	DEFEND,
	USE_ITEM,
	FLEE
}

# Sistema nemici SafePlace
const ENEMY_TYPES = {
	"BANDIT": {"base_hp": 25, "base_attack": 6, "base_defense": 3, "tier_scaling": 1.2},
	"RAIDER": {"base_hp": 35, "base_attack": 8, "base_defense": 4, "tier_scaling": 1.3},
	"MUTANT": {"base_hp": 40, "base_attack": 7, "base_defense": 5, "tier_scaling": 1.4},
	"ROBOT": {"base_hp": 50, "base_attack": 10, "base_defense": 6, "tier_scaling": 1.5}
}

var current_state: CombatState = CombatState.INACTIVE
var game_manager: GameManager
var player: Player
var item_database: ItemDatabase

# Combat data
var current_combat: Dictionary = {}
var combat_log: Array[String] = []

func _ready():
	print("⚔️ SafePlaceCombatSystem inizializzato")
	_initialize_system()

func _initialize_system():
	# Trova riferimenti ai sistemi
	game_manager = get_node("/root/GameManager") as GameManager
	if game_manager:
		player = game_manager.get_player() if game_manager.has_method("get_player") else null
		item_database = game_manager.get_item_database() if game_manager.has_method("get_item_database") else null

	if not player:
		player = get_node("../../Player") as Player

	print("⚔️ SafePlace Combat System collegato ai sistemi principali")

## Inizia combattimento con regole SafePlace autentiche
func start_combat(enemy_type: String, tier: int = 1) -> Dictionary:
	if current_state != CombatState.INACTIVE:
		print("❌ Combattimento già in corso")
		return {}

	print("🥊 INIZIO COMBATTIMENTO SAFEPLACE vs %s (Tier %d)" % [enemy_type, tier])
	current_state = CombatState.PREPARING

	# Crea dati player usando regole SafePlace
	var player_data = _create_player_combatant()

	# Crea nemico usando regole SafePlace
	var enemy_data = _create_enemy_combatant(enemy_type, tier)

	# Inizializza combat data
	current_combat = {
		"player": player_data,
		"enemy": enemy_data,
		"turn": 1,
		"max_turns": 10,
		"rounds": [],
		"tier": tier
	}

	combat_started.emit(player_data, enemy_data)

	# Esegui combattimento automatico SafePlace style
	var result = _resolve_safeplace_combat()

	current_state = CombatState.COMPLETED
	combat_ended.emit(result)

	return result

## Crea combattente player con regole SafePlace autentiche
func _create_player_combatant() -> Dictionary:
	if not player:
		print("❌ Player non trovato")
		return {}

	# Calcoli autentici SafePlace dal codice originale
	var pot_modifier = floor(player.pot / 2.0) # Attack bonus da Power
	var agi_modifier = floor(player.agi / 2.0) # Defense da Agility
	var vig_resistance = floor(player.vig / 3.0) # Resistance da Vigor

	# Equipment bonus (già implementato in Fase 2!)
	var weapon_bonus = player.get_equipment_bonus("attack")
	var armor_bonus = player.get_equipment_bonus("defense")

	# Weapon damage da database reale
	var weapon_damage = {"min": 1, "max": 4, "bonus": 0} # Base fists

	# TODO: Implementare weapon lookup dal database
	# Per ora usiamo damage base + weapon bonus
	weapon_damage.bonus = weapon_bonus

	# Defense Class SafePlace: 10 + AGI modifier + armor bonus
	var defense_class = 10 + agi_modifier + armor_bonus

	var player_data = {
		"name": "Ultimo",
		"hp": player.hp,
		"max_hp": player.max_hp,
		"attack_bonus": pot_modifier + weapon_bonus,
		"defense_class": defense_class,
		"damage": weapon_damage,
		"resistance": vig_resistance,
		"stats": {
			"pot": player.pot,
			"agi": player.agi,
			"vig": player.vig
		},
		"equipment_bonus": {
			"attack": weapon_bonus,
			"defense": armor_bonus
		}
	}

	print("👤 Player Combat Data:")
	print("   ATK Bonus: %d (POT: %d + Equipment: %d)" % [player_data.attack_bonus, pot_modifier, weapon_bonus])
	print("   Defense Class: %d (10 + AGI: %d + Armor: %d)" % [defense_class, agi_modifier, armor_bonus])
	print("   Resistance: %d (VIG: %d ÷ 3)" % [vig_resistance, player.vig])

	return player_data

## Crea nemico con scaling SafePlace autentico
func _create_enemy_combatant(enemy_type: String, tier: int) -> Dictionary:
	var base_data = ENEMY_TYPES.get(enemy_type, ENEMY_TYPES.BANDIT)
	var scaling = pow(base_data.tier_scaling, tier - 1)

	var enemy_data = {
		"name": enemy_type.capitalize(),
		"type": enemy_type,
		"tier": tier,
		"hp": int(base_data.base_hp * scaling),
		"max_hp": int(base_data.base_hp * scaling),
		"attack_bonus": int(base_data.base_attack * scaling),
		"defense_class": 10 + int(base_data.base_defense * scaling),
		"damage": {"min": 1, "max": 6 + tier, "bonus": tier - 1},
		"resistance": int(2 * scaling)
	}

	print("👹 Enemy Combat Data:")
	print("   %s Tier %d (Scaling: %.2f)" % [enemy_type, tier, scaling])
	print("   HP: %d, ATK: %d, DEF: %d, RES: %d" % [enemy_data.hp, enemy_data.attack_bonus, enemy_data.defense_class, enemy_data.resistance])

	return enemy_data

## Risolve combattimento completo con regole SafePlace
func _resolve_safeplace_combat() -> Dictionary:
	var player_data = current_combat.player
	var enemy_data = current_combat.enemy

	var player_hp = player_data.hp
	var enemy_hp = enemy_data.hp

	var rounds = []
	var victory = false

	# Combattimento fino a 10 round (come originale)
	for turn in range(1, current_combat.max_turns + 1):
		print("\n🥊 ROUND %d" % turn)

		# Player attacca per primo
		var player_attack = _resolve_safeplace_attack(player_data, enemy_data)
		enemy_hp -= player_attack.damage

		var round_data = {
			"turn": turn,
			"player_attack": player_attack,
			"enemy_hp_after": max(0, enemy_hp)
		}

		print("   Player: %s → Enemy HP: %d" % [_format_attack_result(player_attack), max(0, enemy_hp)])

		# Check vittoria
		if enemy_hp <= 0:
			victory = true
			round_data.result = "VICTORY"
			rounds.append(round_data)
			break

		# Enemy contrattacca
		var enemy_attack = _resolve_safeplace_attack(enemy_data, player_data)
		player_hp -= enemy_attack.damage

		round_data.enemy_attack = enemy_attack
		round_data.player_hp_after = max(0, player_hp)

		print("   Enemy: %s → Player HP: %d" % [_format_attack_result(enemy_attack), max(0, player_hp)])

		# Check sconfitta
		if player_hp <= 0:
			round_data.result = "DEFEAT"
			rounds.append(round_data)
			break

		round_data.result = "CONTINUE"
		rounds.append(round_data)
		combat_round_completed.emit(round_data)

	# Calcola risultato finale
	var final_result = {
		"victory": victory,
		"rounds": rounds,
		"turns_count": rounds.size(),
		"final_player_hp": max(0, player_hp),
		"final_enemy_hp": max(0, enemy_hp),
		"damage_dealt": enemy_data.hp - max(0, enemy_hp),
		"damage_taken": player_data.hp - max(0, player_hp),
		"exp_gained": (5 + current_combat.tier * 3) if victory else 0
	}

	# Applica danni al player reale
	if player:
		player.hp = final_result.final_player_hp
		print("💔 Player HP aggiornato: %d/%d" % [player.hp, player.max_hp])

	print("\n🎯 RISULTATO COMBATTIMENTO:")
	print("   %s in %d round" % ["VITTORIA" if victory else "SCONFITTA", final_result.turns_count])
	print("   Danni inflitti: %d, Danni subiti: %d" % [final_result.damage_dealt, final_result.damage_taken])

	return final_result

## Risolve singolo attacco con regole SafePlace autentiche
func _resolve_safeplace_attack(attacker: Dictionary, defender: Dictionary) -> Dictionary:
	# SafePlace attack roll: 1d20 + attack bonus
	var attack_roll = randi_range(1, 20) + attacker.attack_bonus
	var hit = attack_roll >= defender.defense_class

	var result = {
		"attacker": attacker.name,
		"roll": attack_roll,
		"target_defense": defender.defense_class,
		"hit": hit,
		"damage": 0,
		"critical": false
	}

	if hit:
		# SafePlace damage: weapon dice + bonus
		var base_damage = randi_range(attacker.damage.min, attacker.damage.max) + attacker.damage.bonus

		# Critical hit (natural 20)
		var critical = (attack_roll - attacker.attack_bonus) == 20
		if critical:
			base_damage *= 2
			result.critical = true

		# Applica resistance SafePlace style
		var final_damage = max(1, base_damage - defender.resistance)
		result.damage = final_damage

	return result

## Utility per formattare risultato attacco
func _format_attack_result(attack: Dictionary) -> String:
	if not attack.hit:
		return "MISS (Roll: %d vs DEF: %d)" % [attack.roll, attack.target_defense]

	var result = "%d damage" % attack.damage
	if attack.critical:
		result = "CRIT! " + result
	return result + " (Roll: %d vs DEF: %d)" % [attack.roll, attack.target_defense]

## Utility per dice roll
func roll_dice(min_val: int, max_val: int) -> int:
	return randi_range(min_val, max_val)

func roll_d20() -> int:
	return randi_range(1, 20)

## Reset sistema
func reset_combat():
	current_state = CombatState.INACTIVE
	current_combat.clear()
	combat_log.clear()
	print("🔄 SafePlace Combat System reset")

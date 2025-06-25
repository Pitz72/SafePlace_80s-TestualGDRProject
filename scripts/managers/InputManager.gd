extends Node

## InputManager Singleton - The Safe Place v0.1.6
## 
## Gestisce centralmente tutti gli input del gioco con sistema di stati.
## Architettura: Stato corrente determina quali segnali emettere per input ricevuti.
## 
## Stati supportati: MAP (movimento mondo), INVENTORY (navigazione inventario), 
## DIALOGUE (dialoghi NPC), COMBAT (sistema combattimento)
## 
## Progettato come Singleton (Autoload) per gestione input globale unificata.

# ========================================
# ENUM STATI INPUT
# ========================================

## Stati possibili del sistema di input
enum InputState {
	MAP,        # Movimento sulla mappa mondiale
	INVENTORY,  # Navigazione inventario attiva
	DIALOGUE,   # Sistema dialoghi con NPC
	COMBAT      # Sistema combattimento turn-based
}

# ========================================
# SEGNALI PUBBLICI
# ========================================

## Emesso per movimento sulla mappa (WASD/Frecce)
## @param direction: Vector2i con direzione (-1,0,1 per x/y)
signal map_move(direction: Vector2i)

## Emesso per navigazione inventario (WASD/Frecce)
## @param direction: Vector2i con direzione navigazione
signal inventory_navigate(direction: Vector2i)

## Emesso per attivazione/disattivazione inventario (I)
signal inventory_toggle()

## Emesso per uso oggetto inventario (1-9)
## @param slot_number: int numero slot (1-9)
signal inventory_use_item(slot_number: int)

## Emesso per azione generica (SPACE/ENTER)
signal action_confirm()

## Emesso per cancellazione/indietro (ESC)
signal action_cancel()

## Emesso per azioni combat specifiche
## @param action: String tipo azione ("attack", "defend", "flee")
signal combat_action(action: String)

## Emesso per cambio stato input
## @param old_state: InputState stato precedente
## @param new_state: InputState nuovo stato
signal state_changed(old_state: InputState, new_state: InputState)

# ========================================
# VARIABILI STATO
# ========================================

## Stato corrente del sistema di input
var current_state: InputState = InputState.MAP

## Flag per debug input (stampa azioni in console)
var debug_input: bool = false

# ========================================
# INIZIALIZZAZIONE
# ========================================

func _ready() -> void:
	print("🎮 InputManager inizializzazione...")
	print("   ✅ Stato iniziale: %s" % InputState.keys()[current_state])
	print("   ✅ Segnali configurati: 8 segnali pubblici")
	
	# Debug disattivato - sistema funzionante
	debug_input = false
	print("   ✅ Sistema input centralizzato operativo")
	
	print("✅ InputManager pronto - Gestione input centralizzata attiva")

# ========================================
# API PUBBLICA - GESTIONE STATI
# ========================================

## Cambia lo stato corrente del sistema di input
## @param new_state: InputState nuovo stato da impostare
func set_state(new_state: InputState) -> void:
	if new_state == current_state:
		return  # Nessun cambiamento necessario
	
	var old_state = current_state
	current_state = new_state
	
	if debug_input:
		print("🎮 InputManager: %s → %s" % [InputState.keys()[old_state], InputState.keys()[new_state]])
	
	# Emetti segnale di cambio stato
	state_changed.emit(old_state, new_state)

## Restituisce lo stato corrente
## @return: InputState stato attuale
func get_current_state() -> InputState:
	return current_state

## Abilita/disabilita debug input
## @param enabled: bool se true stampa debug in console
func set_debug(enabled: bool) -> void:
	debug_input = enabled
	print("🎮 InputManager debug: %s" % ("ATTIVO" if enabled else "DISATTIVO"))

# ========================================
# GESTIONE INPUT CENTRALIZZATA
# ========================================

func _input(event: InputEvent) -> void:
	# Processa solo eventi pressed (non released)
	if not event.is_pressed():
		return
	
	# Gestione input globali (sempre attivi)
	if _handle_global_input(event):
		return
	
	# Gestione input specifici per stato
	match current_state:
		InputState.MAP:
			_handle_map_input(event)
		InputState.INVENTORY:
			_handle_inventory_input(event)
		InputState.DIALOGUE:
			_handle_dialogue_input(event)
		InputState.COMBAT:
			_handle_combat_input(event)

## Gestisce input globali (sempre attivi indipendentemente dallo stato)
## @param event: InputEvent evento da processare
## @return: bool true se evento è stato gestito
func _handle_global_input(event: InputEvent) -> bool:
	# Toggle inventario (I) - sempre disponibile
	if event.is_action_pressed("ui_inventory") or Input.is_key_pressed(KEY_I):
		if debug_input:
			print("🎮 Input: INVENTORY_TOGGLE")
		inventory_toggle.emit()
		return true
	
	# Azione cancellazione (ESC) - sempre disponibile
	if event.is_action_pressed("ui_cancel") or Input.is_key_pressed(KEY_ESCAPE):
		if debug_input:
			print("🎮 Input: ACTION_CANCEL")
		action_cancel.emit()
		return true
	
	# PROBLEMA RISOLTO: Hotkey numerici 1-9 SEMPRE attivi (globali)
	for i in range(1, 10):
		var key_code = KEY_1 + (i - 1)  # KEY_1, KEY_2, ..., KEY_9
		if Input.is_key_pressed(key_code):
			if debug_input:
				print("🎮 Input: INVENTORY_USE_ITEM %d (globale)" % i)
			inventory_use_item.emit(i)
			return true
	
	return false

## Gestisce input specifici per stato MAP
## @param event: InputEvent evento da processare
func _handle_map_input(event: InputEvent) -> void:
	var direction = Vector2i.ZERO
	
	# Movimento WASD + Frecce
	if event.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		direction.y = -1
	elif event.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		direction.y = 1
	elif event.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		direction.x = -1
	elif event.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		direction.x = 1
	
	# Emetti segnale movimento se c'è una direzione
	if direction != Vector2i.ZERO:
		if debug_input:
			print("🎮 Input: MAP_MOVE %s" % str(direction))
		map_move.emit(direction)
		return
	
	# Azione conferma (SPACE/ENTER)
	if event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_SPACE):
		if debug_input:
			print("🎮 Input: ACTION_CONFIRM")
		action_confirm.emit()

## Gestisce input specifici per stato INVENTORY
## @param event: InputEvent evento da processare
func _handle_inventory_input(event: InputEvent) -> void:
	var direction = Vector2i.ZERO
	
	# Navigazione inventario WASD + Frecce
	if event.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W):
		direction.y = -1
	elif event.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S):
		direction.y = 1
	elif event.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A):
		direction.x = -1
	elif event.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D):
		direction.x = 1
	
	# Emetti segnale navigazione se c'è una direzione
	if direction != Vector2i.ZERO:
		if debug_input:
			print("🎮 Input: INVENTORY_NAVIGATE %s" % str(direction))
		inventory_navigate.emit(direction)
		return
	
	# Azione conferma (SPACE/ENTER)
	if event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_SPACE):
		if debug_input:
			print("🎮 Input: ACTION_CONFIRM (inventory)")
		action_confirm.emit()

## Gestisce input specifici per stato DIALOGUE
## @param event: InputEvent evento da processare
func _handle_dialogue_input(event: InputEvent) -> void:
	# Per ora solo azioni di conferma/cancellazione
	# TODO: Implementare quando sistema dialoghi sarà sviluppato
	
	if event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_SPACE):
		if debug_input:
			print("🎮 Input: ACTION_CONFIRM (dialogue)")
		action_confirm.emit()

## Gestisce input specifici per stato COMBAT
## @param event: InputEvent evento da processare
func _handle_combat_input(event: InputEvent) -> void:
	# Azioni combattimento base
	# TODO: Espandere quando sistema combattimento sarà implementato
	
	# A = Attack, D = Defend, F = Flee
	if Input.is_key_pressed(KEY_A):
		if debug_input:
			print("🎮 Input: COMBAT_ACTION attack")
		combat_action.emit("attack")
	elif Input.is_key_pressed(KEY_D):
		if debug_input:
			print("🎮 Input: COMBAT_ACTION defend")
		combat_action.emit("defend")
	elif Input.is_key_pressed(KEY_F):
		if debug_input:
			print("🎮 Input: COMBAT_ACTION flee")
		combat_action.emit("flee")
	elif event.is_action_pressed("ui_accept") or Input.is_key_pressed(KEY_SPACE):
		if debug_input:
			print("🎮 Input: ACTION_CONFIRM (combat)")
		action_confirm.emit()

# ========================================
# UTILITIES E DEBUG
# ========================================

## Restituisce il nome dello stato corrente come stringa
## @return: String nome stato corrente
func get_state_name() -> String:
	return InputState.keys()[current_state]

## Stampa informazioni di debug dello stato corrente
func print_debug_info() -> void:
	print("🎮 InputManager Debug Info:")
	print("   • Stato corrente: %s" % get_state_name())
	print("   • Debug attivo: %s" % debug_input)
	print("   • Segnali disponibili: map_move, inventory_navigate, inventory_toggle, etc.") 
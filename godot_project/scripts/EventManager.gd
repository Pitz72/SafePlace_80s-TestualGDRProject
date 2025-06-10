class_name EventManager
extends Node

# EventManager - Sistema eventi SafePlace
# Versione bridge per compatibilità con GameManager

# Segnali per compatibilità
signal event_started(event_data: Dictionary)
signal event_ended(event_id: String, result: Dictionary)

func _ready():
	print("📖 EventManager: Sistema eventi inizializzato")

func trigger_random_event():
	"""Metodo di compatibilità per GameManager"""
	print("📖 EventManager: Evento casuale triggato")
	
# Metodo has_method() rimosso - era illegale override di Object.has_method() 
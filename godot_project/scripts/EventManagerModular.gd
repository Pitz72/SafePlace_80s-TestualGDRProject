# 📚 EVENT MANAGER MODULAR - THE SAFE PLACE v1.3.0
# Modular event system to prevent massive single files
# Loads events from separate modules by category

extends Node

enum EventType {
	RANDOM_ENCOUNTER,
	LOCATION_SPECIFIC,
	STORY_DRIVEN,
	UNIQUE_EVENT
}

# Event modules registry - using preload() for proper loading
var event_modules = []
var events_database = {}
var events_loaded = false

func _ready():
	# Register all event modules using preload()
	event_modules = [
		preload("res://scripts/events/EventsPlains.gd"),
		preload("res://scripts/events/EventsForest.gd"),
		preload("res://scripts/events/EventsCity.gd"),
		preload("res://scripts/events/EventsVillage.gd"),
		preload("res://scripts/events/EventsRiver.gd")
		# EventsDesert,  # To be created in next sessions
		# EventsUnique   # To be created in next sessions
	]
	
	load_all_events()

func load_all_events():
	"""Load events from all registered modules"""
	print("🔄 Loading events from modular system...")
	
	events_database.clear()
	var total_events = 0
	
	for module_script in event_modules:
		if module_script and module_script.has_method("get_events_database"):
			var module_events = module_script.get_events_database()
			var module_name = str(module_script).get_file().get_basename()
			
			print("📦 Loading from ", module_name, ": ", module_events.size(), " events")
			
			# Merge module events into main database
			for event_id in module_events:
				if events_database.has(event_id):
					print("⚠️ WARNING: Duplicate event ID: ", event_id)
				else:
					events_database[event_id] = module_events[event_id]
					total_events += 1
	
	print("✅ Total events loaded: ", total_events)
	events_loaded = true

func get_event(event_id: String) -> Dictionary:
	"""Get specific event by ID"""
	if not events_loaded:
		load_all_events()
	
	if events_database.has(event_id):
		return events_database[event_id]
	else:
		print("❌ Event not found: ", event_id)
		return {}

func get_events_by_type(type: EventType) -> Array:
	"""Get all events of specific type"""
	if not events_loaded:
		load_all_events()
	
	var filtered_events = []
	for event_id in events_database:
		var event = events_database[event_id]
		if event.has("type") and event.type == type:
			filtered_events.append(event)
	
	return filtered_events

func get_random_event_by_type(type: EventType) -> Dictionary:
	"""Get random event of specific type"""
	var events_of_type = get_events_by_type(type)
	if events_of_type.size() > 0:
		var random_index = randi() % events_of_type.size()
		return events_of_type[random_index]
	else:
		return {}

func get_random_location_event() -> Dictionary:
	"""Get random location-specific event"""
	return get_random_event_by_type(EventType.LOCATION_SPECIFIC)

func trigger_event(event_id: String) -> void:
	"""Trigger specific event (integration with UI)"""
	var event_data = get_event(event_id)
	if not event_data.is_empty():
		# Integrate with MainInterface popup system - access through scene tree
		var game_manager = get_parent()
		if game_manager and game_manager.has_method("add_log") and game_manager.name == "GameManager":
			game_manager.add_log("Event triggered: " + event_data.get("name", event_id))
		print("🎪 Event triggered: ", event_data.get("name", event_id))
	else:
		print("❌ Cannot trigger event: ", event_id)

func reload_events():
	"""Reload all events (useful for development)"""
	print("🔄 Reloading all event modules...")
	load_all_events()

func get_stats() -> Dictionary:
	"""Get event system statistics"""
	if not events_loaded:
		load_all_events()
	
	var stats = {
		"total_events": events_database.size(),
		"modules_loaded": event_modules.size(),
		"events_by_type": {}
	}
	
	# Count events by type
	for type in EventType.values():
		stats.events_by_type[EventType.keys()[type]] = get_events_by_type(type).size()
	
	return stats

# Development/Debug functions
func print_stats():
	"""Print detailed statistics (debug)"""
	var stats = get_stats()
	print("📊 EVENT SYSTEM STATS:")
	print("   Total Events: ", stats.total_events)
	print("   Modules: ", stats.modules_loaded)
	print("   By Type:")
	for type_name in stats.events_by_type:
		print("     ", type_name, ": ", stats.events_by_type[type_name])

func list_all_events():
	"""List all event IDs (debug)"""
	if not events_loaded:
		load_all_events()
	
	print("📝 ALL EVENTS:")
	for event_id in events_database:
		var event = events_database[event_id]
		print("   ", event_id, " - ", event.get("name", "Unknown")) 
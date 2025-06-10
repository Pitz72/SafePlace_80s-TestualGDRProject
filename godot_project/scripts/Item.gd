class_name Item
extends Resource

## Base class per tutti gli oggetti nel gioco SafePlace
## Migrazione da game_data.js ITEM_DATA structure

# Identificazione base
@export var id: String = ""
@export var name: String = ""
@export var nameShort: String = ""
@export var description: String = ""

# Categorizzazione
@export var type: String = "" # food, water, medicine, weapon, armor, tool, resource, ammo, blueprint
@export var subtype: String = "" # weaponType, armorType, etc.

# Proprietà fisiche
@export var weight: float = 0.0
@export var value: int = 0

# Stack e uso
@export var stackable: bool = false
@export var usable: bool = false
@export var equipable: bool = false
@export var max_portions: int = 1

# Durabilità (per armi/armature)
@export var durability: int = 0
@export var maxDurability: int = 0

# Equipment specifics
@export var slot: String = "" # weapon, body, head, accessory
@export var armorValue: int = 0

# Weapon specifics
@export var weaponType: String = "" # mischia, bianca_corta, bianca_lunga, lancio, fuoco, balestra, arco
@export var damage_min: int = 0
@export var damage_max: int = 0
@export var ammoType: String = ""
@export var ammoPerShot: int = 1
@export var magazineSize: int = 0

# Tool specifics
@export var charges: int = 0

# Ammo specifics  
@export var quantityPerStack: int = 1

# Effects system (serialized as String array, parsed at runtime)
@export var effects: Array[String] = []

# Utility methods
func is_weapon() -> bool:
	return type == "weapon"

func is_armor() -> bool:
	return type == "armor"

func is_consumable() -> bool:
	return type in ["food", "water", "medicine"]

func is_tool() -> bool:
	return type == "tool"

func get_damage_range() -> Vector2i:
	return Vector2i(damage_min, damage_max)

func has_durability() -> bool:
	return maxDurability > 0

func is_broken() -> bool:
	return has_durability() and durability <= 0

func get_condition_percentage() -> float:
	if not has_durability():
		return 100.0
	return (float(durability) / float(maxDurability)) * 100.0

func get_display_name() -> String:
	if nameShort.length() > 0:
		return nameShort
	return name

func get_weight_display() -> String:
	if weight < 1.0:
		return "%.1f kg" % weight
	else:
		return "%.0f kg" % weight

func can_stack_with(other_item: Item) -> bool:
	if not stackable or not other_item.stackable:
		return false
	return id == other_item.id and type == other_item.type

# Create item from JavaScript data structure (migration helper)
static func from_js_data(item_id: String, data: Dictionary) -> Item:
	var item = Item.new()
	item.id = item_id
	item.name = data.get("name", "")
	item.nameShort = data.get("nameShort", "")
	item.description = data.get("description", "")
	item.type = data.get("type", "")
	item.weight = data.get("weight", 0.0)
	item.value = data.get("value", 0)
	item.stackable = data.get("stackable", false)
	item.usable = data.get("usable", false)
	item.equipable = data.get("equipable", false)
	item.max_portions = data.get("max_portions", 1)
	
	# Durability
	item.durability = data.get("durability", data.get("maxDurability", 0))
	item.maxDurability = data.get("maxDurability", 0)
	
	# Equipment
	item.slot = data.get("slot", "")
	item.armorValue = data.get("armorValue", 0)
	
	# Weapon
	item.weaponType = data.get("weaponType", "")
	if data.has("damage") and data.damage is Dictionary:
		item.damage_min = data.damage.get("min", 0)
		item.damage_max = data.damage.get("max", 0)
	elif data.has("damage") and data.damage is int:
		item.damage_min = data.damage
		item.damage_max = data.damage
	
	item.ammoType = data.get("ammoType", "")
	item.ammoPerShot = data.get("ammoPerShot", 1)
	item.magazineSize = data.get("magazineSize", 0)
	
	# Tool
	item.charges = data.get("charges", 0)
	
	# Ammo
	item.quantityPerStack = data.get("quantityPerStack", 1)
	
	# Effects (convert from JS array to String array)
	if data.has("effects") and data.effects is Array:
		for effect in data.effects:
			item.effects.append(JSON.stringify(effect))
	
	return item 
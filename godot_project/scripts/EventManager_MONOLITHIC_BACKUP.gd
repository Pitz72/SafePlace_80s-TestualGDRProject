extends Node
class_name EventManagerBackup

## EventManager per SafePlace
## Gestisce eventi narrativi, scelte multiple e conseguenze

signal event_started(event_data: Dictionary)
signal event_ended(event_id: String, result: Dictionary)
signal choice_presented(choices: Array)
signal choice_made(choice_index: int, choice_data: Dictionary)
signal narrative_updated(text: String)
signal achievement_unlocked(achievement_id: String)  # FUTURE: Sistema achievements Session #009+

## Tipi di eventi
enum EventType {
	RANDOM_ENCOUNTER,
	LOCATION_SPECIFIC,
	STORY_PROGRESSION,
	CHARACTER_INTERACTION,
	SURVIVAL_EVENT,
	SPECIAL_CONDITION
}

## Stati dell'evento
enum EventState {
	INACTIVE,
	PRESENTING,
	WAITING_CHOICE,
	PROCESSING,
	COMPLETED
}

@export var current_state: EventState = EventState.INACTIVE
@export var debug_mode: bool = false

# Riferimenti ai sistemi
var game_manager: GameManager
var player: Player
var item_database: ItemDatabase

# Evento corrente
var current_event: Dictionary = {}
var event_history: Array[String] = []
var story_flags: Dictionary = {}

# Database eventi (semplificato per ora)
var events_database: Dictionary = {}

func _ready():
	print("📖 EventManager inizializzato")
	_initialize_event_system()
	_load_events_database()

## Inizializza sistema eventi
func _initialize_event_system():
	# Trova riferimenti ai sistemi
	game_manager = get_node("../GameManager") if get_node_or_null("../GameManager") else null
	player = get_node("../../WorldContainer/Player") if get_node_or_null("../../WorldContainer/Player") else null
	
	if game_manager and game_manager.has_method("get_item_database"):
		item_database = game_manager.get_item_database()
	
	# Connetti segnali
	if game_manager:
		game_manager.game_state_changed.connect(_on_game_state_changed)
	
	if player:
		player.stats_changed.connect(_on_player_stats_changed)
	
	print("📖 Sistema eventi collegato ai sistemi principali")

## Carica database eventi
func _load_events_database():
	# Database eventi integrato (in futuro da file JSON)
	events_database = {
		# ==========================================
		# EVENTI ESISTENTI (MANTENUTI)
		# ==========================================
		"bandito_encounter": {
			"id": "bandito_encounter",
			"name": "Incontro con Bandito",
			"type": EventType.RANDOM_ENCOUNTER,
			"description": "Un bandito ti blocca la strada, impugnando un coltello arrugginito.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attaccalo",
					"requirements": {},
					"consequences": {
						"action": "start_combat",
						"data": {
							"enemy": {
								"name": "Bandito",
								"max_hp": 40,
								"attack": 8,
								"defense": 2,
								"experience": 12
							}
						}
					}
				},
				{
					"text": "Cerca di persuaderlo",
					"requirements": {"inf": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "inf",
						"difficulty": 12,
						"success": {
							"text": "Il bandito si convince e se ne va.",
							"rewards": {"experience": 8}
						},
						"failure": {
							"text": "Il bandito ride e ti attacca!",
							"action": "start_combat",
							"data": {
								"enemy": {
									"name": "Bandito Arrabbiato",
									"max_hp": 40,
									"attack": 10,
									"defense": 2,
									"experience": 12
								}
							}
						}
					}
				},
				{
					"text": "Scappa",
					"requirements": {"agi": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "agi",
						"difficulty": 10,
						"success": {
							"text": "Riesci a scappare velocemente.",
							"rewards": {}
						},
						"failure": {
							"text": "Inciampi e il bandito ti raggiunge!",
							"action": "start_combat",
							"data": {
								"enemy": {
									"name": "Bandito",
									"max_hp": 40,
									"attack": 8,
									"defense": 2,
									"experience": 12
								}
							}
						}
					}
				},
				{
					"text": "Offri cibo",
					"requirements": {"food": 10},
					"consequences": {
						"action": "pay_cost",
						"cost": {"food": 10},
						"success": {
							"text": "Il bandito accetta il cibo e se ne va contento.",
							"rewards": {"experience": 5},
							"set_flag": "bandito_fed"
						}
					}
				}
			]
		},
		
		"strange_chest": {
			"id": "strange_chest",
			"name": "Cassa Misteriosa",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Trovi una cassa di metallo parzialmente sepolta. Sembra intatta.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Aprila con cautela",
					"requirements": {},
					"consequences": {
						"action": "random_outcome",
						"outcomes": [
							{
								"chance": 0.4,
								"text": "Dentro trovi una pozione di cura!",
								"rewards": {"items": {"health_potion": 1}}
							},
							{
								"chance": 0.3,
								"text": "La cassa contiene materiali utili.",
								"rewards": {"items": {"scrap_metal": 2}}
							},
							{
								"chance": 0.2,
								"text": "È vuota, ma ben conservata.",
								"rewards": {}
							},
							{
								"chance": 0.1,
								"text": "Un meccanismo scatta! Perdi HP.",
								"damage": 10
							}
						]
					}
				},
				{
					"text": "Ignorala e prosegui",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non rischiare e prosegui.",
						"rewards": {}
					}
				}
			]
		},
		
		"water_source": {
			"id": "water_source",
			"name": "Fonte d'Acqua",
			"type": EventType.SURVIVAL_EVENT,
			"description": "Trovi una piccola fonte d'acqua. L'acqua sembra pulita.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Bevi e riempi le scorte",
					"requirements": {},
					"consequences": {
						"action": "restore_resource",
						"resource": "water",
						"amount": 30,
						"text": "Ti disseti e riempi le tue scorte d'acqua."
					}
				},
				{
					"text": "Controlla prima la qualità",
					"requirements": {"tra": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tra",
						"difficulty": 10,
						"success": {
							"text": "L'acqua è pulita e sicura. Ti disseti completamente.",
							"action": "restore_resource",
							"resource": "water",
							"amount": 50
						},
						"failure": {
							"text": "Non sei sicuro della qualità, bevi con cautela.",
							"action": "restore_resource",
							"resource": "water",
							"amount": 20
						}
					}
				},
				{
					"text": "Non bere, troppo rischioso",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non rischiare e prosegui.",
						"rewards": {}
					}
				}
			]
		},
		
		# ==========================================
		# NUOVI EVENTI IMPORTATI - SESSIONE #010
		# PLAINS EVENTS (1-10 di 1189 totali)
		# ==========================================
		
		"plains_bones": {
			"id": "plains_bones",
			"name": "Ossa nella Polvere",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato. Un macabro segnale della fragilità della vita qui.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ispeziona le ossa (Tracce)",
					"requirements": {"tracce": 9},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 9,
						"success": {
							"text": "Esaminando con attenzione, trovi una vecchia fibbia di metallo e qualche moneta arrugginita di un'era dimenticata. Forse non molto utili ora, ma un segno del passato.",
							"rewards": {"items": {"scrap_metal": 1, "bandages_dirty": 1}}
						},
						"failure": {
							"text": "Solo ossa sbiancate e polvere. Qualunque cosa di valore è andata perduta da tempo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cerca indizi sulla causa della morte (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Un brivido ti percorre la schiena. Percepisci un'eco di violenza e disperazione legata a queste ossa. Trovi un piccolo, enigmatico frammento di un diario.",
							"rewards": {"items": {"lore_fragment": 1}}
						},
						"failure": {
							"text": "Non riesci a cogliere nulla di particolare, solo la tristezza della morte in un luogo desolato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lascia riposare i morti (Ignora)",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non disturbare ulteriormente i resti. Mostri rispetto e prosegui il tuo cammino.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_carcass": {
			"id": "plains_carcass",
			"name": "Banchetto Funebre",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Avvicinati con cautela (Adattamento)",
					"requirements": {"adattamento": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 10,
						"success": {
							"text": "Nonostante il tanfo, riesci a recuperare qualche pezzo di carne utilizzabile, anche se cruda.",
							"rewards": {"items": {"meat_raw": 1}}
						},
						"failure": {
							"text": "L'odore è troppo forte e gli insetti troppo aggressivi. Meglio lasciar perdere.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ispeziona da lontano (Presagio)",
					"requirements": {"presagio": 9},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 9,
						"success": {
							"text": "Osservando da una distanza sicura, noti che la carcassa è fresca e non sembra attirare altri predatori al momento. Potrebbe valere la pena rischiare.",
							"rewards": {}
						},
						"failure": {
							"text": "Da questa distanza è difficile capire molto, se non che puzza terribilmente.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ignora e prosegui",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che il rischio o il tanfo non valgono la pena. Ti allontani rapidamente.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_wind": {
			"id": "plains_wind",
			"name": "Vento della Desolazione",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Il vento spazza la pianura arida, sollevando polvere e sussurrando storie di vuoto. Non c'è nient'altro.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ascolta il vento",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti fermi ad ascoltare il vento. Per un momento, sembra portare echi di voci lontane, ma poi è solo vento.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_youth_memory": {
			"id": "plains_youth_memory",
			"name": "Frammenti d'Infanzia",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Un vecchio parco giochi arrugginito emerge dalla sabbia. Altalene contorte cigolano nel vento. Per un attimo, ricordi com'era essere solo un bambino, senza il peso della sopravvivenza.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esplorare i resti (Presagio)",
					"requirements": {"presagio": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 10,
						"success": {
							"text": "Mentre ti arrampichi sulla struttura del vecchio scivolo, noti un piccolo vano segreto. Dentro, una scatoletta di cibo e una bottiglia d'acqua, insieme a un piccolo oggetto utile.",
							"rewards": {"items": {"canned_food": 1, "water_bottle": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "La struttura metallica cede sotto il tuo peso, facendoti cadere. Non c'era nulla di utile, solo fantasmi di risate perdute.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Riflettere in silenzio",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti siedi sull'altalena, lasciando che i ricordi affiorino. Questa pausa ti ridà energia mentale, anche se il tempo è prezioso.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_lonely_flower": {
			"id": "plains_lonely_flower",
			"name": "Fiore Solitario",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "In mezzo all'aridità, un singolo, tenace fiore di un colore innaturalmente vivido lotta per la sopravvivenza. È un piccolo, strano segno di vita in questo nulla.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Osservare da vicino (Presagio)",
					"requirements": {"presagio": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 10,
						"success": {
							"text": "Il fiore emana una strana energia. Toccandolo delicatamente, senti una sensazione di pace e trovi delle bacche nascoste alla base.",
							"rewards": {"items": {"berries": 2, "vitamins": 1}}
						},
						"failure": {
							"text": "È solo un fiore. Bello, ma inutile per la sopravvivenza.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Raccogliere il fiore",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Raccogli il fiore colorato. Forse non ha utilità pratica, ma la sua bellezza ti ricorda che c'è ancora speranza nel mondo.",
						"rewards": {"items": {"cloth_rags": 1}}
					}
				},
				{
					"text": "Lasciare il fiore",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di lasciare che il fiore continui la sua lotta solitaria. Prosegui, portando con te l'immagine di quella piccola vittoria della vita.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_rusty_sign": {
			"id": "plains_rusty_sign",
			"name": "Cartello Arrugginito",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Un vecchio cartello stradale, piegato e corroso dalla ruggine, emerge a malapena dal terreno. Le scritte sono quasi illeggibili, ma forse indica qualcosa di importante... o di pericoloso.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Decifrare le scritte (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Pulendo la ruggine, riesci a leggere: 'Rifugio 15 km E'. Trovi anche del metallo utilizzabile dal cartello.",
							"rewards": {"items": {"scrap_metal": 2, "map_fragment": 1}}
						},
						"failure": {
							"text": "La ruggine ha corroso troppo il metallo. Le scritte sono illeggibili.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Controllare la base (Tracce)",
					"requirements": {"tracce": 9},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 9,
						"success": {
							"text": "Scavando attorno alla base del cartello, trovi una piccola cache nascosta da qualche viaggiatore.",
							"rewards": {"items": {"water_bottle": 1, "ration_pack": 1}}
						},
						"failure": {
							"text": "Solo terra e radici secche. Nulla di interessante.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ignorare il cartello",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che non vale la pena perdere tempo con un vecchio cartello arrugginito. Prosegui per la tua strada.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_dust_devil": {
			"id": "plains_dust_devil",
			"name": "Diavolo di Polvere",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Un piccolo ma intenso turbine di polvere e detriti si forma improvvisamente davanti a te, danzando sulla pianura.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attraversare rapidamente (Agilità)",
					"requirements": {"agilita": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "agilita",
						"difficulty": 12,
						"success": {
							"text": "Corri attraverso il turbine con agilità. La polvere ti sferza, ma nel centro trovi oggetti sollevati dal vento.",
							"rewards": {"items": {"cloth_rags": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Il turbine ti travolge, riempiendoti occhi e polmoni di polvere. Tossisci e ti allontani, disorientato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Fare un largo giro",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di aggirare il turbine, perdendo un po' di tempo ma evitando il rischio. La prudenza è spesso la scelta migliore.",
						"rewards": {}
					}
				},
				{
					"text": "Aspettare che si dissolva",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti fermi e osservi il turbine danzare. Dopo qualche minuto si dissolve naturalmente, lasciando solo polvere nell'aria.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_mirage": {
			"id": "plains_mirage",
			"name": "Miraggio Ingannevole",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "In lontananza, sotto il sole cocente, vedi quella che sembra un'oasi: acqua scintillante e vegetazione lussureggiante. Potrebbe essere reale, o un crudele scherzo della tua mente affaticata.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Avvicinarsi con cautela (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "Il tuo istinto ti dice che è un miraggio, ma investigando la zona trovi una piccola sorgente nascosta e qualche risorsa.",
							"rewards": {"items": {"water_purified": 1, "berries": 1}}
						},
						"failure": {
							"text": "Era solo un miraggio. Ti ritrovi in mezzo al nulla, più assetato e deluso di prima.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ignorare la visione",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Scuoti la testa e continui per la tua strada. I miraggi sono crudeli inganni del deserto, meglio non farsi tentare.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_fallen_scavenger": {
			"id": "plains_fallen_scavenger",
			"name": "Saccheggiatore Caduto",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Trovi il corpo di un altro sventurato, evidentemente un saccheggiatore, morto da poco. Il suo zaino è semiaperto.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Frugare nello zaino (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Con rispetto per il morto, esamini lo zaino. Trovi provviste utili e un'arma.",
							"rewards": {"items": {"ration_pack": 1, "water_bottle": 1, "weapon_knife": 1}}
						},
						"failure": {
							"text": "Lo zaino è vuoto o il contenuto è rovinato. Il povero diavolo non aveva molto.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Controllare i dintorni (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Esamini la scena. Segni di lotta, ma anche indizi su cosa abbia ucciso il saccheggiatore. Trovi delle munizioni sparse.",
							"rewards": {"items": {"ammo_basic": 1, "bandages_dirty": 1}}
						},
						"failure": {
							"text": "Non riesci a capire cosa sia successo. Meglio non indugiare troppo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lasciare stare",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di rispettare il morto e non disturbare i suoi resti. Sussurri una preghiera e prosegui.",
						"rewards": {}
					}
				}
			]
		},
		
		# ==========================================
		# FOREST EVENTS (11-20 di 1189 totali)
		# ==========================================
		
		"forest_noises": {
			"id": "forest_noises",
			"name": "Fruscio nel Sottobosco",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Il silenzio innaturale della foresta è rotto da un fruscio sospetto tra i cespugli. Animale... o qualcos'altro? Indagare potrebbe essere rischioso.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Indaga furtivamente (Tracce)",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Ti muovi come un'ombra. È solo un grosso ratto mutato, ma vicino alla sua tana trovi delle bacche e qualche straccio.",
							"rewards": {"items": {"berries": 1, "cloth_rags": 1}}
						},
						"failure": {
							"text": "Pesti un ramo secco, tradendo la tua presenza! Qualunque cosa fosse, è fuggita nel fitto del bosco.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi silenziosamente",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che non vale la pena rischiare. Ti allontani senza far rumore.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_fallen_tree": {
			"id": "forest_fallen_tree",
			"name": "Tronco Annerito",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Un albero enorme, sradicato e con la corteccia stranamente annerita, blocca il sentiero. Scavalcarlo sembra difficile, aggirarlo richiede tempo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Tenta di scavalcare (Agilità)",
					"requirements": {"agilita": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "agilita",
						"difficulty": 11,
						"success": {
							"text": "Con un balzo agile e un po' di fortuna, superi l'ostacolo. Noti un pezzo di metallo utile e una clava grezza incastrata tra i rami.",
							"rewards": {"items": {"scrap_metal": 1, "wooden_club": 1}}
						},
						"failure": {
							"text": "Scivoli e cadi malamente dal tronco. Ti fai male e devi aggirare l'ostacolo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Aggira l'ostacolo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non rischiare. Ti addentri nel bosco fitto, perdendo tempo ma evitando il pericolo immediato.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_hostile_flora": {
			"id": "forest_hostile_flora",
			"name": "Rovi Aggressivi",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Rampicanti spinosi dall'aspetto malato e aggressivo ostruiscono il passaggio. Sembrano quasi contrarsi al tuo avvicinarsi. Nascondono qualcosa o sono solo un altro pericolo?",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esamina i rovi (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Osservando attentamente, noti che le spine secernono una linfa densa. Potrebbe essere usata per creare medicine grezze. Trovi anche dei dardi impigliati.",
							"rewards": {"items": {"medicine_crude": 1, "ammo_arrow": 2}}
						},
						"failure": {
							"text": "Queste piante sembrano ostili e forse velenose. Meglio non rischiare di toccarle.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Forza il passaggio (Potenza)",
					"requirements": {"potenza": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 13,
						"success": {
							"text": "Con forza bruta, strappi i rampicanti spinosi e ti apri un varco, rimediando solo qualche graffio. Trovi uno straccio utile tra le spine.",
							"rewards": {"items": {"cloth_rags": 1}}
						},
						"failure": {
							"text": "Le spine tenaci ti lacerano braccia e vestiti mentre cerchi di passare. Subisci una ferita.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare un'altra via",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che è troppo pericoloso. Cerchi un percorso alternativo attraverso la foresta.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_teen_shelter": {
			"id": "forest_teen_shelter",
			"name": "Rifugio tra gli Alberi",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Una casa sull'albero malconcia, costruita prima del Crollo, si nasconde tra i rami nodosi. Scale improvvisate di corda danneggiate pendono fino a terra. Potrebbe essere stata il nascondiglio di qualcuno della tua età.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Arrampicarsi (Agilità)",
					"requirements": {"agilita": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "agilita",
						"difficulty": 12,
						"success": {
							"text": "Ti arrampichi con cautela. Dentro trovi un diario, delle vitamine e un arco improvvisato lasciato da un altro giovane sopravvissuto.",
							"rewards": {"items": {"vitamins": 1, "improvised_bow": 1, "map_fragment": 1}}
						},
						"failure": {
							"text": "La corda marcia si spezza sotto il tuo peso. Cadi malamente, sbattendo contro un ramo. Un rifugio fuori portata, per ora.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ispezionare la base (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Ai piedi dell'albero trovi un piccolo contenitore impermeabile. Dentro, bende pulite e un po' di cibo.",
							"rewards": {"items": {"bandages_clean": 1, "canned_food": 1}}
						},
						"failure": {
							"text": "Non trovi nulla di utile alla base. Forse ogni cosa di valore è stata già presa, o si trova ancora lassù, irraggiungibile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lasciare perdere",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che è troppo rischioso arrampicarsi. Prosegui per la tua strada.",
						"rewards": {}
					}
				}
			]
		},
		
		# ==========================================
		# RIVER EVENTS (21-25 di 1189 totali)  
		# ==========================================
		
		"river_flow": {
			"id": "river_flow",
			"name": "Corrente Lenta e Torbida",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "L'acqua del fiume scorre pigra e innaturalmente torbida, trascinando detriti irriconoscibili. La puzza leggera suggerisce contaminazione. Raccoglierla è un rischio.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Riempi la borraccia (Rischioso)",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Raccogli l'acqua sospetta. Ricorda: berla senza purificarla potrebbe essere fatale.",
						"rewards": {"items": {"water_dirty": 1}}
					}
				},
				{
					"text": "Osserva la riva (Tracce)",
					"requirements": {"tracce": 9},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 9,
						"success": {
							"text": "Scruti attentamente la riva e noti dei detriti utili trascinati dalla corrente.",
							"rewards": {"items": {"wood_planks": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Non vedi nulla di utile, solo fango e acqua sporca.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi dal fiume",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che il fiume è troppo contaminato. Cerchi un'altra fonte d'acqua.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_youth_reflection": {
			"id": "river_youth_reflection",
			"name": "Riflessi nell'Acqua Torbida",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "La corrente lenta del fiume crea una superficie quasi calma. Ti sporgi per riempire la borraccia e intravedi il tuo riflesso: un volto giovane segnato da esperienze che nessun diciassettenne dovrebbe affrontare. Questo mondo ti ha trasformato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Fermarsi a riposare (Vigore)",
					"requirements": {"vigore": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "vigore",
						"difficulty": 10,
						"success": {
							"text": "Ti permetti un raro momento di pace. Lavi via la polvere del viaggio e raccogli i pensieri. Questo breve ristoro rinvigorisce il corpo e lo spirito. Ti senti pronto a continuare.",
							"rewards": {"items": {"water_purified": 1, "ration_pack": 1}}
						},
						"failure": {
							"text": "Cercando di rilassarti, la stanchezza ti travolge. Ti addormenti brevemente e ti svegli disorientato, sentendoti più affaticato di prima. Hai perso tempo prezioso.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Guardare oltre la superficie (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Scrutando più attentamente l'acqua, noti un bagliore metallico sul fondale poco profondo. Immergendo cautamente un braccio, recuperi un oggetto utile e un frammento di mappa.",
							"rewards": {"items": {"mechanical_parts": 2, "map_fragment": 1}}
						},
						"failure": {
							"text": "Mentre fissi l'acqua, la tua mente vaga. Visioni inquietanti di città sommerse e segreti sepolti ti turbano. Ti allontani dalla riva, sentendoti a disagio.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Proseguire senza indugiare",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Non hai tempo per riflessioni. Il passato è passato, devi concentrarti sulla sopravvivenza.",
						"rewards": {}
					}
				}
			]
		},
		
		# ==========================================
		# VILLAGE EVENTS (23-30 di 1189 totali)  
		# ==========================================
		
		"village_ruins": {
			"id": "village_ruins",
			"name": "Villaggio Fantasma",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Le rovine silenziose di un piccolo insediamento. Tende strappate e baracche vuote gemono al vento. Cosa è successo qui? Forse è rimasto qualcosa tra le macerie.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cerca tra le macerie (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Dopo un'attenta ricerca tra i detriti polverosi, trovi diverse provviste utili!",
							"rewards": {"items": {"canned_food": 1, "water_bottle": 1, "cloth_rags": 2, "kitchen_knife": 1}}
						},
						"failure": {
							"text": "Trovi solo polvere, vetri rotti e i fantasmi silenziosi di vite spezzate. Nulla di utile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Riposati all'ombra",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti siedi al riparo di un muro diroccato, recuperando un po' il fiato, ma il silenzio del luogo è opprimente.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_school_ruins": {
			"id": "village_school_ruins",
			"name": "Rovine della Scuola",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "I resti di una piccola scuola si ergono tra le case abbandonate. Graffiti sbiaditi e poster educativi si aggrappano ancora alle pareti crepate. Un luogo che un tempo era pieno di ragazzi come te, ora solo un guscio vuoto.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare nella biblioteca (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Tra scaffali crollati e libri ammuffiti, trovi un manuale di primo soccorso e un frammento di mappa locale.",
							"rewards": {"items": {"first_aid_kit": 1, "map_fragment": 1}}
						},
						"failure": {
							"text": "La biblioteca è un disastro di carta marcita e polvere. Qualsiasi cosa utile è stata danneggiata dall'umidità o saccheggiata tempo fa.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ispezionare l'aula di scienze (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "Nel laboratorio devastato, il tuo intuito ti guida verso un armadietto. Dentro, un antidoto e delle pillole dall'aspetto sospetto.",
							"rewards": {"items": {"antidote": 1, "medicine_crude": 1}}
						},
						"failure": {
							"text": "Il laboratorio è un pericolo: vetri rotti, sostanze chimiche versate e odori acri. Meglio non rischiare di toccare nulla.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi dalla scuola",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Il luogo ti mette a disagio. Meglio cercare risorse altrove.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_well": {
			"id": "village_well",
			"name": "Il Pozzo del Villaggio",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Al centro del villaggio si trova un pozzo di pietra. Sembra profondo, e non sai se l'acqua sul fondo sia potabile o se ci sia ancora acqua.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Calare un secchio (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Improvvisi un secchio con una corda. L'acqua è torbida ma potabile dopo purificazione.",
							"rewards": {"items": {"water_dirty": 3, "rope": 1}}
						},
						"failure": {
							"text": "Non riesci a improvvisare un sistema per attingere acqua. Il pozzo rimane inaccessibile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lanciare un sasso",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Lanci un sasso nel pozzo. Senti un tonfo sordo dopo qualche secondo. C'è acqua, ma è profonda.",
						"rewards": {}
					}
				},
				{
					"text": "Cercare contaminazione (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Il tuo istinto ti dice che l'acqua è relativamente sicura. Trovi anche una vecchia corda nascosta.",
							"rewards": {"items": {"rope": 1, "water_purified": 1}}
						},
						"failure": {
							"text": "Non riesci a determinare se l'acqua è sicura. Meglio essere cauti.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"village_echo_laughter": {
			"id": "village_echo_laughter",
			"name": "Eco di Risate",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Per un fugace istante, ti sembra di sentire l'eco di risate infantili provenire da una delle case vuote. Un brivido ti corre lungo la schiena.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Investigare la casa (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "Seguendo l'eco, trovi una stanza nascosta con giocattoli e un piccolo tesoro.",
							"rewards": {"items": {"vitamins": 1, "cloth_rags": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "La casa è vuota e silenziosa. Forse era solo la tua immaginazione.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Gridare per rispondere",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Gridi verso la casa. Solo il tuo eco risponde, creando un effetto inquietante.",
						"rewards": {}
					}
				},
				{
					"text": "Allontanarsi rapidamente",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che alcune cose è meglio lasciarle in pace. Ti allontani rapidamente dal villaggio.",
						"rewards": {}
					}
				}
			]
		},
		
		# ==========================================
		# CITY EVENTS (31-35 di 1189 totali)
		# ==========================================
		
		"city_shadows": {
			"id": "city_shadows",
			"name": "Ombre tra i Grattacieli",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Scheletri di grattacieli graffiano il cielo plumbeo. Il vento fischia tra le finestre rotte come un lamento. Pericolo e tesori dimenticati si nascondono in ogni angolo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esplora un palazzo (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "Il tuo istinto ti guida verso un edificio che sembra meno pericolante. All'interno, tra le macerie, trovi provviste, materiali e forse qualcosa per difenderti.",
							"rewards": {"items": {"canned_food": 1, "water_bottle": 1, "scrap_metal": 2, "bandages_clean": 1, "weapon_pipe": 1}}
						},
						"failure": {
							"text": "Il palazzo è un labirinto di pericoli e vicoli ciechi. Non trovi nulla di utile e rischi di perderti o peggio. Meglio ritirarsi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Attraversa la strada",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Corri attraverso lo spazio aperto, sentendo gli occhi invisibili delle finestre vuote su di te. Raggiungi l'altro lato senza incidenti, per ora.",
						"rewards": {}
					}
				}
			]
		},
		
		"city_medical_supply": {
			"id": "city_medical_supply",
			"name": "Farmacia Saccheggiata",
			"type": EventType.LOCATION_SPECIFIC,
			"description": "Le insegne sbiadite di una farmacia. Dentro, scaffali rovesciati e blister vuoti ovunque. Forse è rimasto qualcosa di utile tra il disastro.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cerca medicine (Adattamento)",
					"requirements": {"adattamento": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 13,
						"success": {
							"text": "Con pazienza, rovistando tra scatole rotte e vetri infranti, la tua mano si chiude su alcune forniture mediche!",
							"rewards": {"items": {"antidote": 1, "vitamins": 1, "bandages_clean": 2}}
						},
						"failure": {
							"text": "Saccheggiata a fondo. Trovi solo confezioni vuote e odore di disinfettante stantio.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare attrezzature mediche",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Tra i detriti trovi alcuni strumenti medici ancora utilizzabili.",
							"rewards": {"items": {"first_aid_kit": 1, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "Tutto è stato saccheggiato o distrutto. Solo vetri rotti e polvere.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Uscire dalla farmacia",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che il rischio di vetri rotti e possibili contaminazioni non vale la pena.",
						"rewards": {}
					}
				}
			]
		}
	}
	
	print("📖 Database eventi caricato: ", events_database.size(), " eventi totali")
	print("📊 SESSIONE #010: +25 eventi importati (PLAINS+FOREST+RIVER) dal JS originale")

## Avvia evento per ID
func start_event(event_id: String) -> bool:
	if current_state != EventState.INACTIVE:
		print("❌ Evento già in corso!")
		return false
	
	if not events_database.has(event_id):
		print("❌ Evento non trovato: ", event_id)
		return false
	
	current_event = events_database[event_id].duplicate(true)
	
	# Controlla condizioni evento
	if not _check_event_conditions(current_event.get("conditions", {})):
		print("❌ Condizioni evento non soddisfatte")
		return false
	
	current_state = EventState.PRESENTING
	
	print("📖 Avviando evento: ", current_event.get("name", event_id))
	
	# Notifica inizio evento
	event_started.emit(current_event)
	
	# Aggiorna GameManager
	if game_manager:
		game_manager.change_state("EVENT")
	
	# Presenta l'evento
	_present_event()
	
	return true

## Presenta evento al player
func _present_event():
	current_state = EventState.WAITING_CHOICE
	
	var description = current_event.get("description", "Evento senza descrizione")
	narrative_updated.emit(description)
	
	# Prepara scelte disponibili
	var available_choices = []
	var choices = current_event.get("choices", [])
	
	for i in range(choices.size()):
		var choice = choices[i]
		if _check_choice_requirements(choice.get("requirements", {})):
			available_choices.append({
				"index": i,
				"text": choice.get("text", "Scelta senza testo"),
				"available": true
			})
		else:
			available_choices.append({
				"index": i,
				"text": choice.get("text", "Scelta senza testo") + " (Requisiti non soddisfatti)",
				"available": false
			})
	
	choice_presented.emit(available_choices)
	
	if debug_mode:
		print("📖 Evento presentato: ", available_choices.size(), " scelte")

## Processa scelta del player
func make_choice(choice_index: int) -> bool:
	if current_state != EventState.WAITING_CHOICE:
		print("❌ Non è il momento di fare una scelta!")
		return false
	
	var choices = current_event.get("choices", [])
	if choice_index < 0 or choice_index >= choices.size():
		print("❌ Indice scelta non valido: ", choice_index)
		return false
	
	var choice = choices[choice_index]
	
	# Verifica requisiti
	if not _check_choice_requirements(choice.get("requirements", {})):
		print("❌ Requisiti per la scelta non soddisfatti")
		return false
	
	current_state = EventState.PROCESSING
	
	# Notifica scelta
	choice_made.emit(choice_index, choice)
	
	# Processa conseguenze
	_process_consequences(choice.get("consequences", {}))
	
	return true

## Processa conseguenze della scelta
func _process_consequences(consequences: Dictionary):
	var action = consequences.get("action", "")
	
	match action:
		"start_combat":
			_start_combat_from_event(consequences.get("data", {}))
		"skill_check":
			_process_skill_check(consequences)
		"pay_cost":
			_process_pay_cost(consequences)
		"random_outcome":
			_process_random_outcome(consequences)
		"restore_resource":
			_process_restore_resource(consequences)
		"simple_result":
			_process_simple_result(consequences)
		_:
			print("❌ Azione sconosciuta: ", action)
			_end_event({})

## Avvia combattimento da evento
func _start_combat_from_event(data: Dictionary):
	if not game_manager or not game_manager.has_method("start_combat"):
		print("❌ Sistema combattimento non disponibile")
		_end_event({})
		return
	
	var enemy_data = data.get("enemy", {})
	
	# Registra per gestire fine combattimento
	if game_manager.has_signal("combat_ended"):
		if not game_manager.combat_ended.is_connected(_on_combat_ended_from_event):
			game_manager.combat_ended.connect(_on_combat_ended_from_event)
	
	# Avvia combattimento tramite GameManager
	game_manager.start_combat(enemy_data)

## Processa skill check
func _process_skill_check(consequences: Dictionary):
	var stat = consequences.get("stat", "")
	var difficulty = consequences.get("difficulty", 10)
	
	if not player:
		print("❌ Player non disponibile per skill check")
		_end_event({})
		return
	
	var player_stat = _get_player_stat(stat)
	var roll = randi_range(1, 20)
	var total = player_stat + roll
	var success = total >= difficulty
	
	var result_text = ""
	if success:
		result_text = "Skill check riuscito! (" + str(total) + " vs " + str(difficulty) + ")"
		var success_data = consequences.get("success", {})
		_apply_result(success_data)
	else:
		result_text = "Skill check fallito. (" + str(total) + " vs " + str(difficulty) + ")"
		var failure_data = consequences.get("failure", {})
		_apply_result(failure_data)
	
	narrative_updated.emit(result_text)
	
	if debug_mode:
		print("📖 Skill check: ", stat, " ", total, " vs ", difficulty, " = ", success)

## Processa pagamento costo
func _process_pay_cost(consequences: Dictionary):
	var cost = consequences.get("cost", {})
	
	if not player:
		_end_event({})
		return
	
	# Verifica se può pagare
	var can_pay = true
	for resource in cost:
		var required = cost[resource]
		var current = _get_player_stat(resource)
		if current < required:
			can_pay = false
			break
	
	if can_pay:
		# Paga il costo
		for resource in cost:
			var amount = cost[resource]
			_set_player_stat(resource, _get_player_stat(resource) - amount)
		
		var success_data = consequences.get("success", {})
		_apply_result(success_data)
	else:
		narrative_updated.emit("Non hai abbastanza risorse per questa scelta.")
		_end_event({})

## Processa outcome casuale
func _process_random_outcome(consequences: Dictionary):
	var outcomes = consequences.get("outcomes", [])
	
	if outcomes.is_empty():
		_end_event({})
		return
	
	var roll = randf()
	var cumulative_chance = 0.0
	
	for outcome in outcomes:
		cumulative_chance += outcome.get("chance", 0.0)
		if roll <= cumulative_chance:
			_apply_result(outcome)
			return
	
	# Fallback al primo outcome
	_apply_result(outcomes[0])

## Processa ripristino risorsa
func _process_restore_resource(consequences: Dictionary):
	if not player:
		_end_event({})
		return
	
	var resource = consequences.get("resource", "")
	var amount = consequences.get("amount", 0)
	var text = consequences.get("text", "Risorsa ripristinata.")
	
	if resource == "water":
		player.water = min(100, player.water + amount)
	elif resource == "food":
		player.food = min(100, player.food + amount)
	elif resource == "hp":
		player.heal(amount, "event")
	
	narrative_updated.emit(text)
	_end_event({"resource_restored": resource, "amount": amount})

## Processa risultato semplice
func _process_simple_result(consequences: Dictionary):
	var text = consequences.get("text", "Evento completato.")
	var rewards = consequences.get("rewards", {})
	
	narrative_updated.emit(text)
	_apply_rewards(rewards)
	_end_event(rewards)

## Applica risultato
func _apply_result(result_data: Dictionary):
	var text = result_data.get("text", "")
	if not text.is_empty():
		narrative_updated.emit(text)
	
	# Applica ricompense
	var rewards = result_data.get("rewards", {})
	_apply_rewards(rewards)
	
	# Gestisci azioni aggiuntive
	if result_data.has("action"):
		_process_consequences(result_data)
	else:
		_end_event(rewards)

## Applica ricompense
func _apply_rewards(rewards: Dictionary):
	if not player:
		return
	
	# Esperienza
	if rewards.has("experience"):
		player.add_experience(rewards["experience"])
	
	# Oggetti
	if rewards.has("items"):
		var items = rewards["items"]
		for item_id in items:
			var quantity = items[item_id]
			player.add_item_to_inventory(item_id, quantity)

## Verifica condizioni evento
func _check_event_conditions(conditions: Dictionary) -> bool:
	if not player:
		return false
	
	for condition in conditions:
		var required_value = conditions[condition]
		var current_value = _get_player_stat(condition)
		
		if current_value < required_value:
			return false
	
	return true

## Verifica requisiti scelta
func _check_choice_requirements(requirements: Dictionary) -> bool:
	if not player:
		return false
	
	for requirement in requirements:
		var required_value = requirements[requirement]
		var current_value = _get_player_stat(requirement)
		
		if current_value < required_value:
			return false
	
	return true

## Termina evento
func _end_event(result: Dictionary):
	var event_id = current_event.get("id", "unknown")
	
	# Aggiungi alla storia
	event_history.append(event_id)
	
	# Segnale di fine evento
	event_ended.emit(event_id, result)
	
	# Reset stato
	current_state = EventState.INACTIVE
	current_event.clear()
	
	# Ritorna al GameManager
	if game_manager:
		game_manager.change_state("PLAYING")
	
	if debug_mode:
		print("📖 Evento terminato: ", event_id)

## Signal handlers
func _on_game_state_changed(new_state):
	# new_state è GameManager.GameState enum, non string
	if new_state != GameManager.GameState.EVENT and current_state != EventState.INACTIVE:
		# Evento interrotto
		_end_event({})

func _on_player_stats_changed(_stat: String, _old_val: int, _new_val: int):
	# Possibili eventi triggered da cambio stats
	pass

func _on_combat_ended_from_event(result: String, rewards: Dictionary):
	# Disconnetti il segnale
	if game_manager and game_manager.combat_ended.is_connected(_on_combat_ended_from_event):
		game_manager.combat_ended.disconnect(_on_combat_ended_from_event)
	
	# Applica ricompense del combattimento
	if result == "victory":
		_apply_rewards(rewards)
		narrative_updated.emit("Hai vinto il combattimento!")
	elif result == "defeat":
		narrative_updated.emit("Sei stato sconfitto...")
	elif result == "fled":
		narrative_updated.emit("Sei fuggito dal combattimento.")
	
	_end_event(rewards)

## Avvia evento casuale
func trigger_random_event() -> bool:
	var random_events = ["bandito_encounter", "strange_chest", "water_source"]
	var random_event = random_events[randi() % random_events.size()]
	
	return start_event(random_event)

## Ottiene eventi disponibili per location
func get_location_events(_location_id: String) -> Array:
	var location_events = []
	
	for event_id in events_database:
		var event_data = events_database[event_id]
		# Gestione type-safe: il tipo può essere int (enum) o string
		var event_type = event_data.get("type", EventType.RANDOM_ENCOUNTER)
		var is_location_specific = false
		
		# Confronto type-safe per enum/string
		if typeof(event_type) == TYPE_INT:
			is_location_specific = (event_type == EventType.LOCATION_SPECIFIC)
		elif typeof(event_type) == TYPE_STRING:
			is_location_specific = (event_type == "LOCATION_SPECIFIC")
		
		if is_location_specific:
			if _check_event_conditions(event_data.get("conditions", {})):
				location_events.append(event_id)
	
	return location_events

## Stato per debugging
func get_event_status() -> Dictionary:
	return {
		"state": EventState.keys()[current_state],
		"current_event": current_event.get("id", "none"),
		"events_in_database": events_database.size(),
		"events_completed": event_history.size(),
		"story_flags": story_flags
	}

## Helper functions per accesso sicuro alle statistiche del player
func _get_player_stat(stat: String) -> int:
	if not player:
		return 0
	
	match stat:
		"hp":
			return player.hp
		"max_hp":
			return player.max_hp
		"food":
			return player.food
		"water":
			return player.water
		"exp":
			return player.exp
		"level":
			return player.level
		"pts":
			return player.pts
		"vig":
			return player.vig
		"pot":
			return player.pot
		"agi":
			return player.agi
		"tra":
			return player.tra
		"inf":
			return player.inf
		"pre":
			return player.pre
		"ada":
			return player.ada
		_:
			print("❌ Stat sconosciuta: ", stat)
			return 0

func _set_player_stat(stat: String, value: int):
	if not player:
		return
	
	match stat:
		"hp":
			player.hp = max(0, value)
		"max_hp":
			player.max_hp = max(1, value)
		"food":
			player.food = clamp(value, 0, 100)
		"water":
			player.water = clamp(value, 0, 100)
		"exp":
			player.exp = max(0, value)
		"level":
			player.level = max(1, value)
		"pts":
			player.pts = max(0, value)
		"vig":
			player.vig = max(0, value)
		"pot":
			player.pot = max(0, value)
		"agi":
			player.agi = max(0, value)
		"tra":
			player.tra = max(0, value)
		"inf":
			player.inf = max(0, value)
		"pre":
			player.pre = max(0, value)
		"ada":
			player.ada = max(0, value)
		_:
			print("❌ Impossibile impostare stat sconosciuta: ", stat) 

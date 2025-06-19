# 🌾 EVENTS PLAINS - THE SAFE PLACE v1.3.0
# Plains/Wasteland specific events module
# Total target: ~200 eventi PLAINS

class_name EventsPlains
extends RefCounted

static func get_events_database() -> Dictionary:
	return {
		"plains_bones": {
			"id": "plains_bones",
			"name": "Ossa nella Polvere",
			"type": 0,
			"description": "Sparse tra la polvere rossastra, scorgi alcune ossa sbiancate dal sole. Potrebbero appartenere a un animale... o a qualcosa di più inquietante. Il vento le fa tintinnare debolmente.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esamina le ossa (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Le ossa appartengono a un piccolo mammifero. Tra di esse trovi alcuni oggetti utili abbandonati.",
							"rewards": {"items": {"bone_fragment": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Le ossa si sbriciolano al tuo tocco. Meglio non disturbare ulteriormente questo luogo di morte.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Passare oltre",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non disturbare i resti. Il rispetto per i morti è una delle poche cose rimaste civilizzate in questo mondo.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_carcass": {
			"id": "plains_carcass",
			"name": "Banchetto Funebre",
			"type": 0,
			"description": "Una carcassa in decomposizione giace nella terra screpolata. Gli avvoltoi si alzano in volo al tuo arrivo, gracchiando minacciosamente. C'è qualcosa di innaturale in questo spettacolo di morte.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ispeziona la carcassa (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Il tuo istinto ti avverte che c'è qualcosa di strano. Trovando il coraggio, scopri materiali utili nascosti sotto la carcassa.",
							"rewards": {"items": {"leather_scraps": 2, "rope": 1}}
						},
						"failure": {
							"text": "L'odore nauseabondo ti costringe a allontanarti. Gli avvoltoi ti osservano con malevolenza.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Scacciare gli avvoltoi (Potenza)",
					"requirements": {"potenza": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 12,
						"success": {
							"text": "Con grida e gesti minacciosi, riesci a scacciare via gli uccelli. Ora puoi ispezionare il sito in pace.",
							"rewards": {"items": {"bird_feather": 3, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Gli avvoltoi sono più aggressivi del previsto. Uno di loro ti graffia prima che tu riesca a ritirti.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi dalla scena",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che il rischio non vale la possibile ricompensa. Ti allontani dal macabro spettacolo.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_wind": {
			"id": "plains_wind",
			"name": "Vento della Desolazione",
			"type": 0,
			"description": "Un vento caldo e secco spazza la pianura, sollevando spirali di polvere rossa. Nel suo sibilo, ti sembra di sentire sussurri del passato: voci di coloro che camminavano qui prima di te.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ascolta i sussurri (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "I sussurri ti guidano verso un nascondiglio segreto. Le voci del passato ti hanno portato fortuna.",
							"rewards": {"items": {"map_fragment": 1, "water_purified": 1}}
						},
						"failure": {
							"text": "I sussurri si trasformano in urla inquietanti. Ti copri le orecchie e aspetti che il vento si calmi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare riparo (Agilità)",
					"requirements": {"agilità": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 10,
						"success": {
							"text": "Trovi rapidamente riparo dietro una formazione rocciosa. Aspettando che passi il vento, scopri una piccola cavità con sorprese.",
							"rewards": {"items": {"cloth_rags": 2, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "Il vento ti sorprende in campo aperto. Devi resistere alla tempesta di polvere con grande difficoltà.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Procedere controvento",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Avanzi a testa bassa contro il vento. È faticoso, ma la determinazione ti porta oltre la tempesta.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_youth_memory": {
			"id": "plains_youth_memory",
			"name": "Frammenti d'Infanzia",
			"type": 0,
			"description": "In lontananza scorgi qualcosa che risveglia un ricordo d'infanzia: una giostra arrugginita, un cartellone pubblicitario sbiadito, i resti di un parco giochi. Il passato chiama, ma il presente è spietato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Avvicinati al ricordo (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Il tuo istinto ti guida con sicurezza. Tra i ricordi del passato trovi qualcosa di utile per il presente.",
							"rewards": {"items": {"toy_fragment": 1, "cloth_rags": 2, "map_fragment": 1}}
						},
						"failure": {
							"text": "I ricordi ti travolgono emotivamente. Ti siedi e piangi per quello che è andato perduto, perdendo tempo prezioso.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ignorare e proseguire",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Il passato è passato. Devi concentrarti sulla sopravvivenza presente.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_lonely_flower": {
			"id": "plains_lonely_flower",
			"name": "Fiore Solitario",
			"type": 0,
			"description": "In mezzo all'aridità, un singolo, tenace fiore di un colore innaturalmente vivido lotta per la sopravvivenza.",
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
							"text": "Il fiore emana una strana energia. Toccandolo delicatamente, senti pace e trovi bacche nascoste.",
							"rewards": {"items": {"berries": 2, "vitamins": 1}}
						},
						"failure": {
							"text": "È solo un fiore. Bello, ma inutile per la sopravvivenza.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"plains_rusty_sign": {
			"id": "plains_rusty_sign",
			"name": "Cartello Arrugginito",
			"type": 0,
			"description": "Un vecchio cartello stradale emerge dal terreno. Le scritte sono illeggibili, ma forse indica qualcosa di importante.",
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
							"text": "Pulendo la ruggine, riesci a leggere: 'Rifugio 15 km E'. Trovi anche metallo utilizzabile.",
							"rewards": {"items": {"scrap_metal": 2, "map_fragment": 1}}
						},
						"failure": {
							"text": "La ruggine ha corroso troppo il metallo. Le scritte sono illeggibili.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"plains_dust_devil": {
			"id": "plains_dust_devil",
			"name": "Diavolo di Polvere",
			"type": 0,
			"description": "Un piccolo ma intenso turbine di polvere si forma davanti a te, danzando sulla pianura.",
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
							"text": "Corri attraverso il turbine con agilità. Nel centro trovi oggetti sollevati dal vento.",
							"rewards": {"items": {"cloth_rags": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Il turbine ti travolge, riempiendoti di polvere. Tossisci e ti allontani, disorientato.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"plains_mirage": {
			"id": "plains_mirage",
			"name": "Miraggio Ingannevole",
			"type": 0,
			"description": "In lontananza vedi un'oasi: acqua scintillante e vegetazione. Potrebbe essere reale, o un miraggio.",
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
							"text": "Il tuo istinto ti dice che è un miraggio, ma investigando trovi una piccola sorgente nascosta.",
							"rewards": {"items": {"water_purified": 1, "berries": 1}}
						},
						"failure": {
							"text": "Era solo un miraggio. Ti ritrovi più assetato e deluso di prima.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"plains_fallen_scavenger": {
			"id": "plains_fallen_scavenger",
			"name": "Saccheggiatore Caduto",
			"type": 0,
			"description": "Trovi il corpo di un altro sventurato, un saccheggiatore morto di recente. Il suo zaino è semiaperto.",
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
							"rewards": {"items": {"ration_pack": 1, "water_bottle": 1, "weapon_improvised": 1}}
						},
						"failure": {
							"text": "Lo zaino è vuoto o il contenuto è rovinato. Il povero non aveva molto.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		# 🔥 NUOVI EVENTI PLAINS AGGIUNTI - MIGRATION SESSIONE #011
		"plains_burned_patch": {
			"id": "plains_burned_patch",
			"name": "Chiazza Bruciata",
			"type": 0,
			"description": "Un'ampia zona di terreno è annerita e vetrificata, come se qualcosa di estremamente caldo fosse esploso.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Avvicinarsi al centro (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Resistendo al calore residuo, raggiungi il centro. Trovi frammenti metallici fusi.",
							"rewards": {"items": {"mechanical_parts": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Il calore è ancora troppo intenso. Ti allontani con le mani bruciacchiate.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Esaminare i margini (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Ai margini della zona bruciata trovi oggetti scagliati via dall'esplosione.",
							"rewards": {"items": {"cloth_rags": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Solo cenere e detriti carbonizzati. Nulla di utile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare l'area",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che l'area è troppo pericolosa. Qualunque cosa sia successa qui, è meglio non rischiare.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_whispers_wind": {
			"id": "plains_whispers_wind",
			"name": "Sussurri nel Vento",
			"type": 0,
			"description": "Il vento sembra trasportare voci distorte e frammenti di melodie dimenticate.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Concentrarsi sui suoni (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "Ascoltando attentamente, distingui parole antiche che ti guidano verso un tesoro nascosto.",
							"rewards": {"items": {"vitamins": 1, "lore_fragment": 1}}
						},
						"failure": {
							"text": "I sussurri si trasformano in un ronzio inquietante. Ti allontani, sentendoti a disagio.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"plains_old_well": {
			"id": "plains_old_well",
			"name": "Vecchio Pozzo Secco",
			"type": 0,
			"description": "Ti imbatti in un vecchio pozzo di pietra, in disuso da decenni. Non c'è traccia di una corda.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Guardare all'interno (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Sporgendoti con cautela, vedi qualcosa lucciccare sul fondo e riesci a recuperarlo.",
							"rewards": {"items": {"water_bottle": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Il pozzo è troppo profondo e buio. Non riesci a vedere nulla di utile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare una corda (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Improvvisi una corda con stracci e rami. Riesci a esplorare il pozzo e trovare un piccolo tesoro.",
							"rewards": {"items": {"water_purified": 1, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "Non riesci a creare nulla di abbastanza resistente per esplorare il pozzo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lasciare perdere",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che il pozzo è troppo rischioso. Meglio non rischiare di cadere dentro.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_scrap_pile": {
			"id": "plains_scrap_pile",
			"name": "Cumulo di Rottami",
			"type": 0,
			"description": "Un ammasso contorto di metallo arrugginito, plastica fusa e altri detriti irriconoscibili. Potrebbe nascondere qualcosa di utile o solo taglienti sorprese.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Frugare con attenzione (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Con pazienza e attenzione, riesci a estrarre materiali utili senza ferirti.",
							"rewards": {"items": {"scrap_metal": 3, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "Ti tagli con un pezzo di metallo affilato. I rottami sono troppo pericolosi da maneggiare.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare il cumulo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che non vale la pena rischiare di ferirsi con i rottami taglienti. Prosegui oltre.",
						"rewards": {}
					}
				}
			]
		},
		
		"plains_traveler_tracks": {
			"id": "plains_traveler_tracks",
			"name": "Tracce di un Viandante Solitario",
			"type": 0,
			"description": "Noti delle impronte chiare e recenti che attraversano la pianura. Appartengono a una singola persona, che sembrava muoversi con uno scopo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Seguire le tracce (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Le tracce ti conducono a una piccola cache nascosta dal viandante. Forse un deposito di emergenza.",
							"rewards": {"items": {"ration_pack": 1, "bandages_clean": 1, "map_fragment": 1}}
						},
						"failure": {
							"text": "Le tracce si perdono su terreno roccioso. Non riesci a seguirle oltre.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Andare nella direzione opposta",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di evitare di incontrare il viandante. Vai nella direzione opposta, preferendo la solitudine.",
						"rewards": {}
					}
				},
				{
					"text": "Ignorare le tracce",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Le tracce non ti interessano. Continui per il tuo cammino senza deviazioni.",
						"rewards": {}
					}
				}
			]
		}
	} 
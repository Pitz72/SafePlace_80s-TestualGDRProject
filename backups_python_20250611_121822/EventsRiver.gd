# 🌊 EVENTS RIVER - THE SAFE PLACE v1.3.0
# River/Water source specific events module
# Total target: ~100 eventi RIVER

class_name EventsRiver
extends RefCounted

static func get_events_database() -> Dictionary:
	return {
		"river_flow": {
			"id": "river_flow",
			"name": "Corrente Lenta e Torbida",
			"type": 0,
			"description": "Un fiume dalle acque scure scorre pigramente davanti a te. La corrente è debole, ma l'acqua ha un colore sospetto. Potrebbe essere una fonte preziosa, oppure una trappola mortale in questo mondo contaminato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Controllare la qualità dell'acqua (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "I tuoi sensi ti suggeriscono che l'acqua, pur torbida, è relativamente sicura. Con un po' di purificazione, sarà potabile.",
							"rewards": {"items": {"water_dirty": 2, "water_purified": 1}}
						},
						"failure": {
							"text": "Non riesci a determinare se l'acqua è sicura. Meglio non rischiare un avvelenamento.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Seguire il fiume (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Seguendo la corrente, trovi un punto dove il fiume è più pulito e scopri anche alcuni oggetti trascinati dall'acqua.",
							"rewards": {"items": {"water_purified": 2, "rope": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Perdi le tracce lungo la riva e ti allontani senza aver trovato nulla di utile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Attraversare il fiume",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di attraversare il fiume, bagnandoti ma raggiungendo l'altra sponda senza incidenti.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_youth_reflection": {
			"id": "river_youth_reflection",
			"name": "Riflessi nell'Acqua Torbida",
			"type": 0,
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
		
		# 🌊 NUOVI EVENTI RIVER AGGIUNTI - MIGRATION SESSIONE #011
		"river_stranded_wreck": {
			"id": "river_stranded_wreck",
			"name": "Relitto Incagliato",
			"type": 0,
			"description": "Lo scheletro arrugginito di una piccola imbarcazione o di un veicolo anfibio è incagliato sulla riva o su un banco di sabbia al centro del fiume torbido.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Raggiungere il relitto (Agilità)",
					"requirements": {"agilità": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 12,
						"success": {
							"text": "Riesci a raggiungere il relitto guadando o saltando. All'interno trovi provviste e materiali utili.",
							"rewards": {"items": {"ration_pack": 1, "scrap_metal": 2, "rope": 1, "common_resource": 1}}
						},
						"failure": {
							"text": "La corrente è più forte del previsto. Rischi di essere trascinato via e devi tornare a riva.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Usare come postazione (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Dal relitto hai una buona visuale del fiume. Noti oggetti trasportati dalla corrente e li recuperi.",
							"rewards": {"items": {"wood_planks": 2, "cloth_rags": 1}}
						},
						"failure": {
							"text": "Il relitto è troppo instabile per essere usato come postazione di osservazione.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ignorare il relitto",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che raggiungere il relitto è troppo rischioso. Prosegui lungo la riva.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_mutated_fish": {
			"id": "river_mutated_fish",
			"name": "Pesci Mutati",
			"type": 0,
			"description": "Vedi dei pesci dalle forme strane e dai colori innaturali nuotare vicino alla superficie. Alcuni sono grossi, altri hanno troppi occhi o pinne deformi.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Tentare di pescare (Adattamento)",
					"requirements": {"adattamento": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 13,
						"success": {
							"text": "Riesci a catturare alcuni pesci mutati. Sembrano commestibili, anche se dall'aspetto strano.",
							"rewards": {"items": {"meat_raw": 2, "fish_mutated": 1}}
						},
						"failure": {
							"text": "I pesci sono troppo veloci o aggressivi. Uno di loro cerca persino di mordere la tua improvvisata lenza.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Osservare il comportamento (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Osservando i pesci, capisci che sono relativamente innocui e noti dove si radunano oggetti sul fondale.",
							"rewards": {"items": {"mechanical_parts": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "I pesci si comportano in modo troppo erratico per essere compresi. Meglio non avvicinarsi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare l'acqua",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che pesci mutati significano acqua pericolosa. Ti allontani dalla riva e continui a monte.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_floating_debris": {
			"id": "river_floating_debris",
			"name": "Detriti Galleggianti",
			"type": 0,
			"description": "Una massa di detriti galleggia verso di te trasportata dalla corrente. Tra i rifiuti potrebbero nascondersi oggetti utili.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Recuperare i detriti (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Tra i detriti trovi oggetti di plastica, metallo e qualche sorpresa utile.",
							"rewards": {"items": {"scrap_metal": 2, "cloth_rags": 1, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "I detriti scivolano via nella corrente prima che tu riesca a recuperarli.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_collapsed_bridge": {
			"id": "river_collapsed_bridge",
			"name": "Ponte Crollato",
			"type": 0,
			"description": "I resti di un ponte attraversano parzialmente il fiume. Piloni rotti emergono dall'acqua come denti di un mostro marino.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attraversare sui resti (Agilità)",
					"requirements": {"agilita": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "agilita",
						"difficulty": 13,
						"success": {
							"text": "Con acrobazie precarie riesci ad attraversare utilizzando i resti del ponte.",
							"rewards": {"items": {"rope": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Scivoli e cadi in acqua. La corrente ti trascina per un breve tratto prima che riesci a uscire.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_water_whispers": {
			"id": "river_water_whispers",
			"name": "Sussurri dell'Acqua",
			"type": 0,
			"description": "L'acqua sembra sussurrare segreti mentre scorre. Voci distorte sembrano emergere dalla corrente.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ascoltare i sussurri (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "I sussurri rivelano la posizione di un tesoro nascosto sulla riva opposta.",
							"rewards": {"items": {"lore_fragment": 1, "water_purified": 1}}
						},
						"failure": {
							"text": "I sussurri diventano un ronzio fastidioso. Ti allontani con un mal di testa.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_dangerous_rapids": {
			"id": "river_dangerous_rapids",
			"name": "Rapide Pericolose",
			"type": 0,
			"description": "Il fiume si restringe formando rapide violente e schiumose. L'acqua ruggisce come un predatore affamato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Navigare le rapide (Agilità)",
					"requirements": {"agilita": 15},
					"consequences": {
						"action": "skill_check",
						"stat": "agilita",
						"difficulty": 15,
						"success": {
							"text": "Con abilità eccezionale riesci a navigare le rapide e trovi materiali portati dalla corrente.",
							"rewards": {"items": {"rope": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Le rapide ti travolgono. Emergi a valle bagnato, dolorante e a mani vuote.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_collapsed_bank": {
			"id": "river_collapsed_bank",
			"name": "Sponda Crollata",
			"type": 0,
			"description": "Una sezione della sponda del fiume è crollata, rivelando strati di terreno e possibili nasconditi sotterranei.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Scavare nel terreno esposto (Tracce)",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Negli strati di terreno esposto trovi oggetti sepolti e materiali utili.",
							"rewards": {"items": {"mechanical_parts": 1, "scrap_metal": 2}}
						},
						"failure": {
							"text": "Il terreno è troppo instabile. Meglio non rischiare un altro crollo.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_amphibian_nests": {
			"id": "river_amphibian_nests",
			"name": "Nidi di Anfibi",
			"type": 0,
			"description": "Strane creature anfibie hanno costruito i loro nidi lungo la riva. Le uova potrebbero essere commestibili, ma i genitori potrebbero non essere d'accordo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Raccogliere uova (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Raccogli alcune uova quando i genitori sono lontani. Sono nutrienti e proteiche.",
							"rewards": {"items": {"food_protein": 2, "vitamins": 1}}
						},
						"failure": {
							"text": "I genitori tornano e non sono contenti. Devi battere in ritirata velocemente.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_inaccessible_island": {
			"id": "river_inaccessible_island",
			"name": "Isola Inaccessibile",
			"type": 0,
			"description": "Una piccola isola nel mezzo del fiume sembra contenere un rifugio abbandonato, ma la corrente è troppo forte per nuotarci.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Costruire una zattera (Adattamento)",
					"requirements": {"adattamento": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 14,
						"success": {
							"text": "Improvvisi una zattera e raggiungi l'isola. Nel rifugio trovi provviste preziose.",
							"rewards": {"items": {"ration_pack": 2, "water_bottle": 1, "first_aid_kit": 1}}
						},
						"failure": {
							"text": "La zattera improvvisata si disintegra nella corrente. Meglio rimanere sulla terraferma.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"river_message_bottle": {
			"id": "river_message_bottle",
			"name": "Bottiglia con Messaggio",
			"type": 0,
			"description": "Una bottiglia sigillata galleggia vicino alla riva. All'interno sembra esserci un messaggio o una mappa.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Recuperare la bottiglia (Tracce)",
					"requirements": {"tracce": 8},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 8,
						"success": {
							"text": "Dentro la bottiglia trovi un messaggio con indizi preziosi e una piccola mappa.",
							"rewards": {"items": {"lore_fragment": 1, "map_fragment": 1}}
						},
						"failure": {
							"text": "La bottiglia si rompe mentre cerchi di prenderla. Il contenuto si disperde nell'acqua.",
							"rewards": {}
						}
					}
				}
			]
		}
	} 
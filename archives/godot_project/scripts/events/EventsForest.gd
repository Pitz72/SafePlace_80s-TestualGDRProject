# 🌲 EVENTS FOREST - THE SAFE PLACE v1.3.0
# Forest specific events module
# Total target: ~300 eventi FOREST

class_name EventsForest
extends RefCounted

static func get_events_database() -> Dictionary:
	return {
		"forest_poison_berries": {
			"id": "forest_poison_berries",
			"name": "Bacche dai Colori Vivaci",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un rumore furtivo tra i cespugli cattura la tua attenzione. Potrebbe essere un animale innocuo, oppure qualcosa di più pericoloso che si muove nell'ombra del sottobosco fitto.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Investigare il rumore (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Seguendo con cautela le tracce, scopri una piccola tana abbandonata con alcuni oggetti nascosti.",
							"rewards": {"items": {"berries": 2, "cloth_rags": 1, "water_bottle": 1}}
						},
						"failure": {
							"text": "Mentre segui le tracce, inciampi e fai rumore. Qualsiasi cosa fosse lì, ora è fuggita.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Rimanere immobile e ascoltare (Presagio)",
					"requirements": {"presagio": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 10,
						"success": {
							"text": "I tuoi sensi ti avvertono di un pericolo. Aspettando pazientemente, vedi una creatura ostile allontanarsi. Puoi procedere in sicurezza.",
							"rewards": {"items": {"map_fragment": 1}}
						},
						"failure": {
							"text": "Non riesci a interpretare i segnali. Il rumore si ferma, lasciandoti nell'incertezza.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi velocemente",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che la prudenza è la migliore strategia. Ti allontani silenziosamente dalla zona.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_fallen_tree": {
			"id": "forest_fallen_tree",
			"name": "Tronco Annerito",
			"type": 0,
			"description": "Un albero massiccio giace attraverso il sentiero, annerito da un incendio di molto tempo fa. Il tronco potrebbe nascondere risorse, ma rimuoverlo richiederà sforzo e ingegno.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare di spostare il tronco (Potenza)",
					"requirements": {"potenza": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 13,
						"success": {
							"text": "Con grande sforzo, riesci a spostare il tronco. Sotto trovi un nascondiglio con provviste lasciate da un precedente viaggiatore.",
							"rewards": {"items": {"canned_food": 2, "water_bottle": 1, "rope": 1, "tool_improvised": 1}}
						},
						"failure": {
							"text": "Il tronco è troppo pesante. Ti affatichi inutilmente cercando di spostarlo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare una via alternativa (Agilità)",
					"requirements": {"agilità": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 11,
						"success": {
							"text": "Trovi un modo agile per aggirare l'ostacolo, scoprendo anche un sentiero nascosto con sorprese.",
							"rewards": {"items": {"berries": 3, "map_fragment": 1}}
						},
						"failure": {
							"text": "Tentando di arrampicarti, scivoli e ti graffi sui rami. Devi tornare indietro.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ispezionare il tronco (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Esaminando attentamente il tronco, scopri cavità naturali che contengono piccoli tesori.",
							"rewards": {"items": {"cloth_rags": 2, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "Il tronco sembra solo un ostacolo. Non trovi nulla di interessante.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_hostile_flora": {
			"id": "forest_hostile_flora",
			"name": "Rovi Aggressivi",
			"type": 0,
			"description": "Il sentiero è bloccato da un groviglio di rovi e spine che sembrano quasi muoversi. La vegetazione qui è cresciuta in modo anomalo, probabilmente a causa delle radiazioni.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Tagliare i rovi (Potenza)",
					"requirements": {"potenza": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 12,
						"success": {
							"text": "Con determinazione, tagli attraverso i rovi. I tuoi sforzi vengono ricompensati: dietro i rovi c'è una radura con risorse.",
							"rewards": {"items": {"berries": 2, "healing_herbs": 1, "wood_sticks": 3}}
						},
						"failure": {
							"text": "I rovi sono più resistenti del previsto. Le spine ti feriscono e devi ritirti.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare un passaggio sicuro (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Il tuo istinto ti guida attraverso un percorso sicuro tra i rovi, evitando le spine più pericolose.",
							"rewards": {"items": {"map_fragment": 1, "safe_passage": 1}}
						},
						"failure": {
							"text": "Non riesci a trovare un passaggio sicuro. I rovi sembrano spostarsi per bloccarti.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Tornare indietro",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che non vale la pena rischiare. Torni sui tuoi passi per trovare un altro percorso.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_teen_shelter": {
			"id": "forest_teen_shelter",
			"name": "Rifugio tra gli Alberi",
			"type": 0,
			"description": "Tra i rami di un albero particolarmente grande, scorgi i resti di quello che sembra un rifugio improvvisato. Probabilmente costruito da qualcuno della tua età. Ti chiedi cosa gli sia successo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esplorare il rifugio (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Arrampicandoti con cura, raggiungi il rifugio. All'interno trovi provviste e un diario che racconta la storia di un altro giovane sopravvissuto.",
							"rewards": {"items": {"diary": 1, "ration_pack": 1, "water_purified": 1, "rope": 1}}
						},
						"failure": {
							"text": "Il rifugio è troppo instabile. Mentre ci provi, alcune assi crollano e devi ritirti per sicurezza.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Chiamare verso il rifugio",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Gridi verso il rifugio per vedere se c'è qualcuno. Solo il silenzio ti risponde, amplificando la solitudine.",
						"rewards": {}
					}
				},
				{
					"text": "Rispettare la privacy e proseguire",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non disturbare quello che potrebbe essere l'ultimo rifugio di qualcuno. Prosegui con rispetto.",
						"rewards": {"items": {"karma_positive": 1}}
					}
				}
			]
		},
		
		# 🌲 NUOVI EVENTI FOREST AGGIUNTI - MIGRATION SESSIONE #011
		"forest_sacrificial_tree": {
			"id": "forest_sacrificial_tree",
			"name": "Albero del Sacrificio",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un grande albero con strani segni incisi nella corteccia. Alla base, resti di un rituale dimenticato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esaminare i segni (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "I simboli rivelano la posizione di un antico nascondiglio druidico.",
							"rewards": {"items": {"lore_fragment": 2, "medicine_crude": 1}}
						},
						"failure": {
							"text": "I segni sono troppo antichi e criptici per essere compresi.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_distant_songs": {
			"id": "forest_distant_songs",
			"name": "Canti Lontani",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Melodie inquietanti fluttuano tra gli alberi, portate dal vento. Potrebbero essere umane... o qualcos'altro.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Seguire i canti (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "I canti ti guidano verso una radura nascosta con provviste abbandonate.",
							"rewards": {"items": {"berries": 3, "water_bottle": 1}}
						},
						"failure": {
							"text": "I canti sembrano condurti in cerchio. Meglio non seguirli oltre.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_hunter_trap": {
			"id": "forest_hunter_trap",
			"name": "Trappola da Cacciatore",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Una trappola per animali abbandonata, ancora funzionante. Potrebbero esserci altre trappole nascoste nella zona.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Disarmare la trappola (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Recuperi materiali metallici dalla trappola e trovi altre trappole nascoste.",
							"rewards": {"items": {"scrap_metal": 2, "rope": 1}}
						},
						"failure": {
							"text": "La trappola scatta, per fortuna senza colpirti. Meglio evitare questa zona.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_symbiotic_plant": {
			"id": "forest_symbiotic_plant",
			"name": "Pianta Simbiotica",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Una pianta dall'aspetto alieno che sembra reagire alla tua presenza. I suoi frutti brillano debolmente.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Raccogliere i frutti (Adattamento)",
					"requirements": {"adattamento": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 13,
						"success": {
							"text": "I frutti sono nutrienti e hanno proprietà curative sorprendenti.",
							"rewards": {"items": {"vitamins": 2, "medicine_crude": 1}}
						},
						"failure": {
							"text": "I frutti sembrano troppo rischiosi da toccare. Potrebbero essere velenosi.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_hidden_path": {
			"id": "forest_hidden_path",
			"name": "Sentiero Nascosto",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un sentiero quasi invisibile si snoda tra la vegetazione fitta. Qualcuno lo ha percorso di recente.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Seguire il sentiero (Tracce)",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Il sentiero conduce a un accampamento abbandonato con provviste.",
							"rewards": {"items": {"ration_pack": 1, "bandages_clean": 1, "rope": 1}}
						},
						"failure": {
							"text": "Perdi il sentiero nella vegetazione fitta e devi tornare indietro.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_whispering_tree": {
			"id": "forest_whispering_tree",
			"name": "Albero Sussurrante",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un albero antico sembra sussurrare segreti quando il vento lo attraversa. La sua corteccia porta strani segni.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ascoltare i sussurri (Presagio)",
					"requirements": {"presagio": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 14,
						"success": {
							"text": "I sussurri rivelano la posizione di una cache nascosta tra le radici.",
							"rewards": {"items": {"lore_fragment": 1, "berries": 2, "medicine_crude": 1}}
						},
						"failure": {
							"text": "I sussurri si trasformano in un rumore inquietante. Ti allontani rapidamente.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_camouflaged_predator": {
			"id": "forest_camouflaged_predator",
			"name": "Predatore Mimetizzato",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Qualcosa si muove tra gli alberi, perfettamente mimetizzato. Solo un lampo di occhi tradisce la sua presenza.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Rimanere immobile (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "Il predatore ti ignora e si allontana, lasciando tracce di una preda recente.",
							"rewards": {"items": {"meat_raw": 1, "cloth_rags": 1}}
						},
						"failure": {
							"text": "Il movimento attira l'attenzione del predatore. Devi fuggire velocemente.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_contaminated_spring": {
			"id": "forest_contaminated_spring",
			"name": "Sorgente Contaminata",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Una sorgente d'acqua ha un colore innaturale e un odore pungente. Potrebbe essere contaminata da sostanze chimiche.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Purificare l'acqua (Adattamento)",
					"requirements": {"adattamento": 15},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 15,
						"success": {
							"text": "Con tecniche improvvisate riesci a rendere l'acqua potabile.",
							"rewards": {"items": {"water_purified": 2}}
						},
						"failure": {
							"text": "L'acqua è troppo contaminata per essere purificata con mezzi rudimentali.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_silent_grove": {
			"id": "forest_silent_grove",
			"name": "Radura Silenziosa",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Una radura dove nessun suono sembra penetrare. Il silenzio è assoluto e innaturale.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Investigare il silenzio (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Il silenzio nasconde una cache sepolta al centro della radura.",
							"rewards": {"items": {"ration_pack": 1, "bandages_sterile": 1}}
						},
						"failure": {
							"text": "Il silenzio diventa opprimente. Devi lasciare la radura rapidamente.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"forest_exposed_roots": {
			"id": "forest_exposed_roots",
			"name": "Radici Esposte",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Enormi radici emergono dal terreno creando un labirinto naturale. Tra di esse si nascondono piccoli tesori.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esplorare tra le radici (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Nascoste tra le radici trovi provviste lasciate da altri viaggiatori.",
							"rewards": {"items": {"berries": 2, "rope": 1, "cloth_rags": 1}}
						},
						"failure": {
							"text": "Le radici formano un labirinto confuso. Meglio non rischiare di perdersi.",
							"rewards": {}
						}
					}
				}
			]
		},
	}
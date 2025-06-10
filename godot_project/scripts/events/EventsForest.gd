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
			"name": "Albero Sacrificale",
			"type": 0,
			"description": "Un albero antico e imponente si erge al centro di una piccola radura. Attorno al suo tronco sono legati strani feticci fatti di ossa, stracci e metallo arrugginito. Emana un'aura inquietante.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esaminare i feticci (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "I feticci nascondono piccoli oggetti di valore, forse offerte. Trovi medicine e materiali utili.",
							"rewards": {"items": {"medicine_crude": 1, "cloth_rags": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "I feticci emanano un'energia malvagia. Ti allontani rapidamente, sentendoti osservato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Danneggiare l'albero (Potenza)",
					"requirements": {"potenza": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 14,
						"success": {
							"text": "Con forza, strappi alcuni feticci e danneggi la corteccia. Trovi oggetti nascosti nelle cavità.",
							"rewards": {"items": {"vitamins": 1, "weapon_improvised": 1}}
						},
						"failure": {
							"text": "L'albero sembra resistere ai tuoi sforzi. I feticci si muovono da soli nel vento.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lasciare la radura",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che questo luogo è troppo inquietante. Ti allontani rapidamente, sentendo gli occhi invisibili seguirti.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_distant_songs": {
			"id": "forest_distant_songs",
			"name": "Eco di Canti Lontani",
			"type": 0,
			"description": "Tra il fruscio delle foglie, ti sembra di udire l'eco sommesso di un canto o una melodia malinconica provenire dalle profondità della foresta.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Seguire il suono (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Il canto ti guida verso una piccola grotta nascosta. All'interno trovi i resti di un accampamento e provviste.",
							"rewards": {"items": {"ration_pack": 1, "bandages_clean": 1, "map_fragment": 1}}
						},
						"failure": {
							"text": "Il suono si allontana sempre di più, portandoti in circolo. Ti ritrovi dove hai iniziato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ignorare il canto",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che è meglio non farsi attirare da suoni misteriosi nella foresta. Continui per il sentiero principale.",
						"rewards": {}
					}
				},
				{
					"text": "Gridare per rispondere",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Gridi verso la fonte del canto. Il suono si interrompe bruscamente, lasciando solo un silenzio inquietante.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_hunter_trap": {
			"id": "forest_hunter_trap",
			"name": "Trappola del Cacciatore Dimenticata",
			"type": 0,
			"description": "Scorgi una vecchia trappola per animali, forse un grosso tagliola o un laccio, parzialmente nascosta dalle foglie. Sembra ancora armata.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Disarmare la trappola (Adattamento)",
					"requirements": {"adattamento": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 13,
						"success": {
							"text": "Con attenzione, riesci a disarmare la trappola e recuperare il metallo e i meccanismi.",
							"rewards": {"items": {"scrap_metal": 2, "mechanical_parts": 1, "rope": 1}}
						},
						"failure": {
							"text": "La trappola scatta mentre cerchi di disarmarla. Per fortuna non ti ferisce, ma è inutilizzabile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Usare come esca (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Attiri un piccolo animale nella trappola. Carne fresca per cena.",
							"rewards": {"items": {"meat_raw": 1, "cloth_rags": 1}}
						},
						"failure": {
							"text": "Nessun animale si avvicina alla trappola. Forse sanno che è pericolosa.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Segnalare e aggirare",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Segni la trappola con un ramo per evitarla e la aggiri con cautela. Meglio non rischiare.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_symbiotic_plant": {
			"id": "forest_symbiotic_plant",
			"name": "Simbionte Vegetale",
			"type": 0,
			"description": "Un cadavere di animale è completamente avvolto da una strana muffa o fungo luminescente che pulsa debolmente. La pianta sembra aver consumato e integrato la creatura.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Prelevare un campione (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Con cautela, prelevi parte del fungo. Potrebbe essere utile per medicine o come fonte di luce.",
							"rewards": {"items": {"medicine_crude": 2, "vitamins": 1}}
						},
						"failure": {
							"text": "Il fungo rilascia spore tossiche quando lo tocchi. Ti allontani tossendo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Distruggere con il fuoco (Potenza)",
					"requirements": {"potenza": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 10,
						"success": {
							"text": "Bruci la simbiosi. Tra le ceneri trovi ossa e oggetti dell'animale originale.",
							"rewards": {"items": {"charcoal": 2, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Il fuoco si spegne rapidamente. Il fungo sembra resistente alle fiamme.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Osservare da lontano",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che è troppo pericoloso avvicinarsi. Osservi il fenomeno da distanza di sicurezza e prosegui.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_hidden_path": {
			"id": "forest_hidden_path",
			"name": "Sentiero Nascosto",
			"type": 0,
			"description": "Noti un sentiero appena percettibile che si inoltra nel fitto della boscaglia, quasi invisibile a un occhio inesperto. Chissà dove conduce.",
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
							"text": "Il sentiero ti conduce a una radura segreta con un piccolo rifugio abbandonato pieno di provviste.",
							"rewards": {"items": {"ration_pack": 2, "water_bottle": 1, "weapon_improvised": 1}}
						},
						"failure": {
							"text": "Il sentiero si perde nel fitto del bosco. Ti ritrovi più confuso di prima.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Segnare sulla mappa",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Segni la posizione del sentiero sulla tua mappa per esplorarlo in futuro. Potrebbe essere utile.",
						"rewards": {"items": {"map_fragment": 1}}
					}
				},
				{
					"text": "Ignorare il sentiero",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di rimanere sui sentieri conosciuti. I percorsi nascosti possono nascondere pericoli.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_whispering_tree": {
			"id": "forest_whispering_tree",
			"name": "L'Albero dei Sussurri",
			"type": 0,
			"description": "Un albero cavo e contorto sembra emettere strani sussurri quando il vento ci passa attraverso. Alcuni dicono che questi alberi custodiscano segreti o attirino spiriti.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ascoltare i sussurri (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "I sussurri ti rivelano la posizione di un tesoro nascosto nelle radici dell'albero.",
							"rewards": {"items": {"vitamins": 1, "lore_fragment": 1, "rare_resource": 1}}
						},
						"failure": {
							"text": "I sussurri diventano un ronzio assordante. Ti allontani con un forte mal di testa.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Lasciare un'offerta",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Lasci un piccolo oggetto alla base dell'albero come offerta. I sussurri sembrano placarsi.",
						"rewards": {"items": {"cloth_rags": 1}}
					}
				},
				{
					"text": "Ignorare l'albero",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non avere nulla a che fare con alberi che sussurrano. Prosegui rapidamente.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_camouflaged_predator": {
			"id": "forest_camouflaged_predator",
			"name": "Predatore Mimetizzato",
			"type": 0,
			"description": "Hai la netta sensazione di essere osservato. Tra il fogliame, qualcosa si muove, perfettamente mimetizzato con l'ambiente.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attacco preventivo (Potenza)",
					"requirements": {"potenza": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 14,
						"success": {
							"text": "Il tuo attacco colpisce nel segno. La creatura ferita fugge, lasciando cadere qualcosa.",
							"rewards": {"items": {"meat_raw": 1, "cloth_rags": 1}}
						},
						"failure": {
							"text": "Il tuo attacco colpisce solo rami e foglie. Qualunque cosa fosse, è fuggita.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi silenziosamente (Agilità)",
					"requirements": {"agilità": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 12,
						"success": {
							"text": "Ti allontani senza essere notato. Nella fuga, trovi un piccolo nascondiglio con provviste.",
							"rewards": {"items": {"bandages_dirty": 1, "canned_food": 1}}
						},
						"failure": {
							"text": "Pesti un ramo secco. Qualunque cosa ti stesse osservando ora sa dove sei.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Rimanere immobile",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti congeli sul posto, sperando di non essere visto. Dopo lunghi minuti, la sensazione di essere osservato svanisce.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_contaminated_spring": {
			"id": "forest_contaminated_spring",
			"name": "Fonte Contaminata",
			"type": 0,
			"description": "Trovi una piccola sorgente d'acqua cristallina, un vero miraggio. Tuttavia, le piante intorno ad essa sono stranamente ingiallite e malate.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Raccogliere l'acqua (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Raccogli l'acqua con cautela. Sembra pulita, ma meglio purificarla prima di berla.",
							"rewards": {"items": {"water_dirty": 2}}
						},
						"failure": {
							"text": "L'acqua ha un odore strano. Meglio non rischiare.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Investigare la contaminazione (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "Scopri che la contaminazione proviene da minerali radioattivi. Trovi alcuni cristalli utili.",
							"rewards": {"items": {"mechanical_parts": 1, "rare_resource": 1}}
						},
						"failure": {
							"text": "Non riesci a capire la causa della contaminazione. Meglio allontanarsi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare la fonte",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che l'acqua contaminata non vale il rischio. Continui la ricerca di una fonte più sicura.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_silent_grove": {
			"id": "forest_silent_grove",
			"name": "Il Bosco Silenzioso",
			"type": 0,
			"description": "Entri in una parte della foresta dove ogni suono sembra attutito. Non ci sono canti di uccelli, né il ronzio di insetti. Solo un silenzio innaturale e pesante.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Procedere con cautela (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "La tua cautela è premiata. Trovi segni di un vecchio accampamento e alcune provviste nascoste.",
							"rewards": {"items": {"ration_pack": 1, "bandages_clean": 1}}
						},
						"failure": {
							"text": "Il silenzio ti mette a disagio. Non trovi nulla e ti allontani rapidamente.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Fare rumore",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Gridi e fai rumore per rompere il silenzio. L'eco della tua voce suona strano e distorto.",
						"rewards": {}
					}
				},
				{
					"text": "Tornare indietro",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Il silenzio innaturale ti spaventa. Torni sui tuoi passi verso una parte più normale della foresta.",
						"rewards": {}
					}
				}
			]
		},
		
		"forest_exposed_roots": {
			"id": "forest_exposed_roots",
			"name": "Radici Esposte",
			"type": 0,
			"description": "Un grosso albero è caduto, esponendo un intricato sistema di radici. Tra di esse, potresti trovare qualcosa di interessante o rimanere intrappolato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Frugare tra le radici (Adattamento)",
					"requirements": {"adattamento": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 10,
						"success": {
							"text": "Tra le radici intricate trovi oggetti sepolti da tempo e materiali utili.",
							"rewards": {"items": {"scrap_metal": 1, "cloth_rags": 2, "common_resource": 1}}
						},
						"failure": {
							"text": "Ti incastri tra le radici e devi lottare per liberarti. Nessun tesoro, solo graffi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Usare come riparo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Le radici esposte formano un riparo naturale. Ti riposi brevemente al sicuro.",
						"rewards": {}
					}
				},
				{
					"text": "Evitare la zona",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Le radici sembrano instabili. Meglio non rischiare di rimanere intrappolato.",
						"rewards": {}
					}
				}
			]
		}
	} 
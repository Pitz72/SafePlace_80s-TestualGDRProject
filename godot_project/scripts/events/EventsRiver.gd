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
			"name": "Oggetti Trasportati dalla Corrente",
			"type": 0,
			"description": "La corrente del fiume trasporta lentamente detriti di ogni tipo: plastica, legno, a volte contenitori sigillati o frammenti di qualcosa di più grande.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Afferrare gli oggetti (Agilità)",
					"requirements": {"agilità": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 11,
						"success": {
							"text": "Con agilità, riesci ad afferrare alcuni oggetti utili trasportati dalla corrente.",
							"rewards": {"items": {"plastic_containers": 2, "wood_planks": 1, "common_resource": 1}}
						},
						"failure": {
							"text": "Gli oggetti scivolano via dalle tue mani o sono troppo lontani dalla riva per essere raggiunti.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Costruire una trappola (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Improvvisi una piccola diga o rete per intrappolare i detriti. Raccogli una buona quantità di materiali.",
							"rewards": {"items": {"scrap_metal": 2, "cloth_rags": 2, "rope": 1}}
						},
						"failure": {
							"text": "La tua trappola improvvisata viene spazzata via dalla corrente. Hai perso tempo e materiali.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Osservare e aspettare",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti siedi sulla riva e osservi la corrente, sperando che porti qualcosa di veramente utile.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_collapsed_bridge": {
			"id": "river_collapsed_bridge",
			"name": "Il Ponte Crollato",
			"type": 0,
			"description": "I resti di un ponte crollato attraversano il fiume. Alcune sezioni sono sommerse, altre emergono come isole di cemento e acciaio contorto.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attraversare sui resti (Agilità)",
					"requirements": {"agilità": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 14,
						"success": {
							"text": "Con equilibrio e coraggio, riesci ad attraversare il fiume saltando sui resti del ponte.",
							"rewards": {"items": {"scrap_metal": 1, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "Un pezzo di cemento cede sotto il tuo peso. Cadi in acqua e devi nuotare disperatamente verso la riva.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare materiali (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Tra le macerie del ponte trovi materiali da costruzione e oggetti metallici utili.",
							"rewards": {"items": {"scrap_metal": 3, "concrete_chunks": 2}}
						},
						"failure": {
							"text": "Le macerie sono troppo pesanti o instabili per essere recuperate in sicurezza.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Usare come riparo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Le sezioni emergenti del ponte offrono un riparo temporaneo dal vento e dalla pioggia.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_water_whispers": {
			"id": "river_water_whispers",
			"name": "Sussurri dall'Acqua",
			"type": 0,
			"description": "Avvicinandoti alla riva, ti sembra di sentire dei sussurri o dei lamenti provenire dalla superficie dell'acqua torbida, come se qualcuno fosse intrappolato sotto.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Chiamare per rispondere (Influenza)",
					"requirements": {"influenza": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "influenza",
						"difficulty": 12,
						"success": {
							"text": "Chiami verso l'acqua. I sussurri si intensificano e ti guidano verso un oggetto sommerso vicino alla riva.",
							"rewards": {"items": {"water_bottle": 1, "lore_fragment": 1}}
						},
						"failure": {
							"text": "I sussurri si trasformano in urla inquietanti. Ti allontani rapidamente, turbato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Cercare la fonte (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "Il tuo istinto ti guida verso la vera fonte dei suoni: un vecchio registratore impermeabile ancora funzionante.",
							"rewards": {"items": {"electronic_device": 1, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "I sussurri sembrano provenire da ovunque e da nessun luogo. Ti allontani confuso.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanarsi rapidamente",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che i sussurri dall'acqua sono un cattivo presagio. Ti allontani velocemente dalla riva.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_dangerous_rapids": {
			"id": "river_dangerous_rapids",
			"name": "Rapide Pericolose",
			"type": 0,
			"description": "Il fiume si restringe e la corrente accelera, formando piccole rapide rumorose e piene di rocce affioranti. Attraversare qui sarebbe molto rischioso.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare un guado (Tracce)",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Seguendo la riva, trovi un punto più calmo dove attraversare in sicurezza.",
							"rewards": {"items": {"map_fragment": 1}}
						},
						"failure": {
							"text": "Non riesci a trovare un punto sicuro per attraversare. Le rapide si estendono troppo a lungo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Costruire una zattera (Adattamento)",
					"requirements": {"adattamento": 15},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 15,
						"success": {
							"text": "Con grande abilità, costruisci una zattera robusta che riesce a superare le rapide.",
							"rewards": {"items": {"wood_planks": 1, "rope": 1}}
						},
						"failure": {
							"text": "La tua zattera improvvisata si disintegra nelle rapide. Per fortuna riesci a nuotare verso la riva.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Tentare l'attraversamento",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di rischiare l'attraversamento diretto. È pericoloso, ma a volte l'audacia paga.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_collapsed_bank": {
			"id": "river_collapsed_bank",
			"name": "Argine Franato",
			"type": 0,
			"description": "Un tratto dell'argine del fiume è franato, creando una parete di fango instabile e rivelando strati di terra e detriti sepolti.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esaminare la frana (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Nella parete franata trovi oggetti sepolti da tempo e minerali esposti.",
							"rewards": {"items": {"scrap_metal": 2, "rare_resource": 1, "mechanical_parts": 1}}
						},
						"failure": {
							"text": "La parete è troppo instabile. Mentre la esamini, altri pezzi di terra cadono.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Scalare la frana (Agilità)",
					"requirements": {"agilità": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "agilità",
						"difficulty": 13,
						"success": {
							"text": "Riesci a scalare la frana e raggiungere un punto elevato con una buona vista della zona.",
							"rewards": {"items": {"map_fragment": 1}}
						},
						"failure": {
							"text": "Il terreno cede sotto i tuoi piedi. Scivoli giù nella frana, coperto di fango.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare la zona",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che la frana è troppo pericolosa. Aggiri la zona instabile con un percorso più lungo.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_amphibian_nests": {
			"id": "river_amphibian_nests",
			"name": "Nidi sulle Rive",
			"type": 0,
			"description": "Lungo le rive fangose, noti numerosi nidi o tane di creature anfibie o semi-acquatiche. Alcuni sembrano occupati.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare uova (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Con cautela, riesci a prendere alcune uova dai nidi abbandonati. Proteine fresche.",
							"rewards": {"items": {"eggs_fresh": 2, "meat_raw": 1}}
						},
						"failure": {
							"text": "Le creature madri tornano ai nidi. Devi scappare rapidamente per evitare i loro attacchi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Osservare le creature (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Osservando le creature, capisci i loro schemi comportamentali e trovi un nascondiglio sicuro.",
							"rewards": {"items": {"cloth_rags": 1, "common_resource": 1}}
						},
						"failure": {
							"text": "Le creature si accorgono della tua presenza e diventano aggressive. Meglio allontanarsi.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare i nidi",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non disturbare le creature nei loro nidi. Aggiri la zona con rispetto per la fauna locale.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_inaccessible_island": {
			"id": "river_inaccessible_island",
			"name": "L'Isolotto Inaccessibile",
			"type": 0,
			"description": "Al centro del fiume, un piccolo isolotto verdeggiante sembra un'oasi di pace. Raggiungerlo, però, richiederebbe di attraversare la corrente forte e l'acqua sospetta.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Costruire un ponte (Adattamento)",
					"requirements": {"adattamento": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 14,
						"success": {
							"text": "Con ingegno, costruisci un ponte improvvisato per raggiungere l'isola. Trovi un piccolo tesoro nascosto.",
							"rewards": {"items": {"ration_pack": 1, "water_purified": 1, "rare_resource": 1}}
						},
						"failure": {
							"text": "Il tuo ponte improvvisato crolla a metà costruzione. I materiali vengono trascinati via dalla corrente.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Nuotare attraverso (Vigore)",
					"requirements": {"vigore": 15},
					"consequences": {
						"action": "skill_check",
						"stat": "vigore",
						"difficulty": 15,
						"success": {
							"text": "Con forza e determinazione, riesci a nuotare fino all'isola e tornare indietro.",
							"rewards": {"items": {"berries": 2, "medicine_crude": 1}}
						},
						"failure": {
							"text": "La corrente è troppo forte. Vieni trascinato a valle e devi lottare per raggiungere la riva.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Ammirare da lontano",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che l'isola è troppo bella e pericolosa per essere raggiunta. La ammiri da lontano e prosegui.",
						"rewards": {}
					}
				}
			]
		},
		
		"river_message_bottle": {
			"id": "river_message_bottle",
			"name": "Il Messaggio nella Bottiglia",
			"type": 0,
			"description": "Incagliata tra i detriti sulla riva, noti una vecchia bottiglia sigillata. All'interno sembra esserci un pezzo di carta arrotolato.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Aprire la bottiglia (Adattamento)",
					"requirements": {"adattamento": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 10,
						"success": {
							"text": "Riesci ad aprire la bottiglia senza romperla. Il messaggio contiene informazioni preziose e coordinate.",
							"rewards": {"items": {"lore_fragment": 1, "map_fragment": 1, "water_bottle": 1}}
						},
						"failure": {
							"text": "La bottiglia si rompe mentre cerchi di aprirla. Il messaggio si bagna e diventa illeggibile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Rimettere in acqua",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di lasciare che il messaggio continui il suo viaggio. Lo rilanci nel fiume, sperando raggiunga qualcun altro.",
						"rewards": {}
					}
				},
				{
					"text": "Conservare sigillata",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Tieni la bottiglia sigillata come un misterioso artefatto. Forse un giorno scoprirai cosa contiene.",
						"rewards": {"items": {"mystery_bottle": 1}}
					}
				}
			]
		}
	} 
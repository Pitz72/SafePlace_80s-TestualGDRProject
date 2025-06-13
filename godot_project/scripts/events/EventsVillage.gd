# 🏘️ EVENTS VILLAGE - THE SAFE PLACE v1.3.0
# Village/Settlement specific events module
# Total target: ~150 eventi VILLAGE

class_name EventsVillage
extends RefCounted

static func get_events_database() -> Dictionary:
	return {
		"village_ruins": {
			"id": "village_ruins",
			"name": "Villaggio Fantasma",
			"type": 0,
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
		
		"village_heavy_silence": {
			"id": "village_heavy_silence",
			"name": "Silenzio Innaturale",
			"type": 0,
			"description": "Un silenzio opprimente grava su questo luogo. Non si sente il vento, né il verso di animali. Un brutto presentimento ti attanaglia.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ascolta l'istinto (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "Il tuo sesto senso ti guida verso una tenda collassata. All'interno, trovi delle bende e un piccolo attrezzo.",
							"rewards": {"items": {"bandages_dirty": 1, "shiv_improvised": 1}}
						},
						"failure": {
							"text": "Ascolti attentamente, ma percepisci solo il silenzio e un crescente senso di disagio. Meglio andarsene.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Allontanati in fretta",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Fidi del tuo istinto e ti allontani rapidamente da questo luogo silenzioso e inquietante.",
						"rewards": {}
					}
				}
			]
		},

		"village_school_ruins": {
			"id": "village_school_ruins",
			"name": "Rovine della Scuola",
			"type": 0,
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
		
		"village_forgotten_altar": {
			"id": "village_forgotten_altar",
			"name": "Altare Dimenticato",
			"type": 0,
			"description": "In una delle baracche meno diroccate, trovi un piccolo altare improvvisato con oggetti strani e simboli scarabocchiati. Sembra un tentativo di placare qualche divinità sconosciuta.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Lasciare un'offerta",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Lasci un piccolo oggetto come offerta. Forse non servirà a nulla, ma rispetti le credenze di chi era qui prima.",
						"rewards": {"items": {"vitamins": 1}}
					}
				},
				{
					"text": "Profanare l'altare (Potenza)",
					"requirements": {"potenza": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "potenza",
						"difficulty": 11,
						"success": {
							"text": "Distruggi l'altare e prendi gli oggetti. Trovi candele, monete e piccoli tesori.",
							"rewards": {"items": {"scrap_metal": 2, "cloth_rags": 1, "charcoal": 1}}
						},
						"failure": {
							"text": "Mentre distruggi l'altare, qualcosa crolla sopra di te. Meglio lasciare stare.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Studiare i simboli (Presagio)",
					"requirements": {"presagio": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 12,
						"success": {
							"text": "I simboli ti rivelano la posizione di una cache nascosta nel villaggio.",
							"rewards": {"items": {"lore_fragment": 1, "map_fragment": 1}}
						},
						"failure": {
							"text": "I simboli sono troppo confusi o danneggiati per essere compresi.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"village_lonely_toy": {
			"id": "village_lonely_toy",
			"name": "Giocattolo Solitario",
			"type": 0,
			"description": "Un giocattolo rotto e sporco – una bambola senza un occhio, un soldatino di piombo – giace abbandonato in mezzo alla polvere di una soglia. Un triste promemoria dei bambini che un tempo vivevano qui.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Raccogliere il giocattolo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Raccogli il giocattolo con delicatezza. Forse non ha valore pratico, ma conserva la memoria di tempi migliori.",
						"rewards": {"items": {"cloth_rags": 1}}
					}
				},
				{
					"text": "Seppellire il giocattolo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Scavi una piccola buca e seppellisci il giocattolo con rispetto. Un piccolo gesto di umanità in un mondo crudele.",
						"rewards": {}
					}
				},
				{
					"text": "Lasciarlo dov'è",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di lasciare il giocattolo dove si trova. Forse qualcun altro lo troverà e ricorderà.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_empty_square": {
			"id": "village_empty_square",
			"name": "Il Silenzio della Piazza",
			"type": 0,
			"description": "Raggiungi quella che un tempo doveva essere la piazza del villaggio. Ora è vuota, con solo il vento che solleva foglie secche. Un silenzio carico di attesa grava sul luogo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Attraversare rapidamente",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Attraversi la piazza il più velocemente possibile, sentendoti esposto e vulnerabile.",
						"rewards": {}
					}
				},
				{
					"text": "Cercare tra i detriti (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Ai margini della piazza trovi oggetti dimenticati e materiali utili.",
							"rewards": {"items": {"scrap_metal": 1, "cloth_rags": 2, "wood_planks": 1}}
						},
						"failure": {
							"text": "Solo polvere e foglie secche. Nulla di valore è rimasto.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Aspettare nascosto",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti nascondi e osservi la piazza per qualche minuto. Nulla si muove, ma la sensazione di essere osservato persiste.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_last_message": {
			"id": "village_last_message",
			"name": "L'Ultimo Messaggio",
			"type": 0,
			"description": "Su un muro sbrecciato, qualcuno ha scritto un breve messaggio con del carbone o vernice sbiadita: un nome, un avvertimento, una preghiera.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Decifrare il messaggio (Adattamento)",
					"requirements": {"adattamento": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 11,
						"success": {
							"text": "Riesci a leggere: 'Cache sotto il pozzo - Maria'. Trovi anche del carbone utilizzabile.",
							"rewards": {"items": {"charcoal": 2, "map_fragment": 1}}
						},
						"failure": {
							"text": "Il messaggio è troppo sbiadito per essere letto chiaramente.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Aggiungere il proprio messaggio",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Scrivi il tuo nome accanto al messaggio. Forse qualcun altro lo leggerà un giorno.",
						"rewards": {"items": {"charcoal": 1}}
					}
				},
				{
					"text": "Ignorare il graffito",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di non perdere tempo con vecchi messaggi. Prosegui la tua esplorazione.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_rancid_smell": {
			"id": "village_rancid_smell",
			"name": "Odore di Cibo Rancido",
			"type": 0,
			"description": "Un debole odore di cibo andato a male proviene da una delle abitazioni. Potrebbe esserci qualcosa di commestibile rimasto, o solo parassiti.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Investigare la fonte (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Tra il cibo marcio trovi alcune conserve ancora sigillate e commestibili.",
							"rewards": {"items": {"canned_food": 1, "ration_pack": 1}}
						},
						"failure": {
							"text": "L'odore è nauseante e tutto il cibo è andato a male. Esci tossendo.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare la baracca",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che l'odore è troppo sospetto. Meglio non rischiare malattie o parassiti.",
						"rewards": {}
					}
				},
				{
					"text": "Attirare creature fuori",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Fai rumore per attirare eventuali parassiti all'esterno, poi controlli se la via è libera.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_rusty_tools": {
			"id": "village_rusty_tools",
			"name": "Strumenti Agricoli Rugginiti",
			"type": 0,
			"description": "Appoggiati a un muro crollato, trovi vecchi attrezzi agricoli: una zappa, una falce, un forcone, tutti consumati dalla ruggine.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Riparare uno strumento (Adattamento)",
					"requirements": {"adattamento": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 13,
						"success": {
							"text": "Con pazienza, riesci a riparare uno degli attrezzi rendendolo utilizzabile come arma improvvisata.",
							"rewards": {"items": {"weapon_pipe": 1, "scrap_metal": 1}}
						},
						"failure": {
							"text": "Gli attrezzi sono troppo corrosi per essere riparati. Si sbriciolano al tuo tocco.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Recuperare il metallo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Raccogli i pezzi di metallo meno corrosi. Potrebbero essere utili per altre riparazioni.",
						"rewards": {"items": {"scrap_metal": 2}}
					}
				},
				{
					"text": "Lasciarli lì",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Gli attrezzi sono troppo rovinati per essere utili. Li lasci dove sono.",
						"rewards": {}
					}
				}
			]
		},
		
		"village_well": {
			"id": "village_well",
			"name": "Il Pozzo del Villaggio",
			"type": 0,
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
		
		"village_hanging_clothes": {
			"id": "village_hanging_clothes",
			"name": "Vestiti Stesi",
			"type": 0,
			"description": "Sorprendentemente, su un filo teso tra due pali, ci sono dei vestiti logori stesi ad asciugare. Qualcuno è stato qui di recente, o li ha dimenticati.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Prendere i vestiti",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Prendi i vestiti dal filo. Sono logori ma potrebbero essere utili per riparazioni o come stracci.",
						"rewards": {"items": {"cloth_rags": 3}}
					}
				},
				{
					"text": "Nascondersi e osservare",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti nascondi e aspetti per vedere se qualcuno torna. Dopo un'ora, nessuno si presenta.",
						"rewards": {}
					}
				},
				{
					"text": "Lasciare un segno",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Lasci un piccolo oggetto per far capire che sei passato, sperando in un contatto pacifico.",
						"rewards": {"items": {"map_fragment": 1}}
					}
				}
			]
		},
		
		"village_scarecrow": {
			"id": "village_scarecrow",
			"name": "Il Guardiano Silenzioso",
			"type": 0,
			"description": "Uno spaventapasseri sbrindellato se ne sta ancora in piedi in quello che un tempo era un orto. I suoi occhi di bottone sembrano seguirti.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ispezionare lo spaventapasseri (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Nascosti nei vestiti dello spaventapasseri trovi piccoli oggetti e materiali utili.",
							"rewards": {"items": {"cloth_rags": 2, "scrap_metal": 1, "rope": 1}}
						},
						"failure": {
							"text": "Lo spaventapasseri è solo paglia e stracci vecchi. Nulla di utile.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Usare come riferimento",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Segni la posizione dello spaventapasseri sulla tua mappa come punto di riferimento.",
						"rewards": {"items": {"map_fragment": 1}}
					}
				},
				{
					"text": "Abbatterlo",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Abbatti lo spaventapasseri. I suoi materiali potrebbero essere utili.",
						"rewards": {"items": {"wood_planks": 1}}
					}
				}
			]
		},
		
		"village_echo_laughter": {
			"id": "village_echo_laughter",
			"name": "Eco di Risate",
			"type": 0,
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
		}
	}

func village_ruins():
	var event = {
		"id": "village_ruins",
		"text": "Villaggio Fantasma - Le rovine silenziose di un piccolo insediamento. Tende strappate e baracche vuote gemono al vento. Cosa è successo qui? Forse è rimasto qualcosa tra le macerie.",
		"location": "village",
		"choices": [
			"Cerca tra le macerie (Tracce)"
		]
	}
	return event

func village_heavy_silence():
	var event = {
		"id": "village_heavy_silence",
		"text": "Silenzio Innaturale - Un silenzio opprimente grava su questo luogo. Non si sente il vento, né il verso di animali. Un brutto presentimento ti attanaglia.",
		"location": "village",
		"choices": [
			"Ascolta l'istinto (Presagio)"
		]
	}
	return event

func village_school_ruins():
	var event = {
		"id": "village_school_ruins",
		"text": "Rovine della Scuola - I resti di una piccola scuola si ergono tra le case abbandonate. Graffiti sbiaditi e poster educativi si aggrappano ancora alle pareti crepate. Un luogo che un tempo era pieno di ragazzi come te, ora solo un guscio vuoto.",
		"location": "village",
		"choices": [
			"Cercare nella biblioteca (Adattamento)"
		]
	}
	return event

func village_forgotten_altar():
	var event = {
		"id": "village_forgotten_altar",
		"text": "Altare Dimenticato - In una delle baracche meno diroccate, trovi un piccolo altare improvvisato con oggetti strani e simboli scarabocchiati. Sembra un tentativo di placare qualche divinità sconosciuta.",
		"location": "village",
		"choices": [
			"Lasciare un'offerta",
			"Profanare l'altare (Potenza)",
			"Studiare i simboli (Presagio)"
		]
	}
	return event

func village_lonely_toy():
	var event = {
		"id": "village_lonely_toy",
		"text": "Giocattolo Solitario - Un giocattolo rotto e sporco – una bambola senza un occhio, un soldatino di piombo – giace abbandonato in mezzo alla polvere di una soglia. Un triste promemoria dei bambini che un tempo vivevano qui.",
		"location": "village",
		"choices": [
			"Raccogliere il giocattolo",
			"Seppellire il giocattolo",
			"Lasciarlo dov'è"
		]
	}
	return event

func village_empty_square():
	var event = {
		"id": "village_empty_square",
		"text": "Il Silenzio della Piazza - Raggiungi quella che un tempo doveva essere la piazza del villaggio. Ora è vuota, con solo il vento che solleva foglie secche. Un silenzio carico di attesa grava sul luogo.",
		"location": "village",
		"choices": [
			"Attraversare rapidamente",
			"Cercare tra i detriti (Tracce)",
			"Aspettare nascosto"
		]
	}
	return event

func village_last_message():
	var event = {
		"id": "village_last_message",
		"text": "L'Ultimo Messaggio - Su un muro sbrecciato, qualcuno ha scritto un breve messaggio con del carbone o vernice sbiadita: un nome, un avvertimento, una preghiera.",
		"location": "village",
		"choices": [
			"Decifrare il messaggio (Adattamento)",
			"Aggiungere il proprio messaggio",
			"Ignorare il graffito"
		]
	}
	return event

func village_rancid_smell():
	var event = {
		"id": "village_rancid_smell",
		"text": "Odore di Cibo Rancido - Un debole odore di cibo andato a male proviene da una delle abitazioni. Potrebbe esserci qualcosa di commestibile rimasto, o solo parassiti.",
		"location": "village",
		"choices": [
			"Investigare la fonte (Adattamento)",
			"Evitare la baracca",
			"Attirare creature fuori"
		]
	}
	return event

func village_rusty_tools():
	var event = {
		"id": "village_rusty_tools",
		"text": "Strumenti Agricoli Rugginiti - Appoggiati a un muro crollato, trovi vecchi attrezzi agricoli: una zappa, una falce, un forcone, tutti consumati dalla ruggine.",
		"location": "village",
		"choices": [
			"Riparare uno strumento (Adattamento)",
			"Recuperare il metallo",
			"Lasciarli lì"
		]
	}
	return event

func village_well():
	var event = {
		"id": "village_well",
		"text": "Il Pozzo del Villaggio - Al centro del villaggio si trova un pozzo di pietra. Sembra profondo, e non sai se l'acqua sul fondo sia potabile o se ci sia ancora acqua.",
		"location": "village",
		"choices": [
			"Calare un secchio (Adattamento)",
			"Lanciare un sasso",
			"Cercare contaminazione (Presagio)"
		]
	}
	return event

func village_hanging_clothes():
	var event = {
		"id": "village_hanging_clothes",
		"text": "Vestiti Stesi - Sorprendentemente, su un filo teso tra due pali, ci sono dei vestiti logori stesi ad asciugare. Qualcuno è stato qui di recente, o li ha dimenticati.",
		"location": "village",
		"choices": [
			"Prendere i vestiti",
			"Nascondersi e osservare",
			"Lasciare un segno"
		]
	}
	return event

func village_scarecrow():
	var event = {
		"id": "village_scarecrow",
		"text": "Il Guardiano Silenzioso - Uno spaventapasseri sbrindellato se ne sta ancora in piedi in quello che un tempo era un orto. I suoi occhi di bottone sembrano seguirti.",
		"location": "village",
		"choices": [
			"Ispezionare lo spaventapasseri (Tracce)",
			"Usare come riferimento",
			"Abbatterlo"
		]
	}
	return event

func village_echo_laughter():
	var event = {
		"id": "village_echo_laughter",
		"text": "Eco di Risate - Per un fugace istante, ti sembra di sentire l'eco di risate infantili provenire da una delle case vuote. Un brivido ti corre lungo la schiena.",
		"location": "village",
		"choices": [
			"Investigare la casa (Presagio)",
			"Gridare per rispondere",
			"Allontanarsi rapidamente"
		]
	}
	return event

# 🏙️ EVENTS CITY - THE SAFE PLACE v1.3.0
# City/Urban specific events module
# Total target: ~300 eventi CITY

class_name EventsCity
extends RefCounted

static func get_events_database() -> Dictionary:
	return {
		"city_shadows": {
			"id": "city_shadows",
			"name": "Ombre tra i Grattacieli",
			"type": 0,  # LOCATION_SPECIFIC
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
		
		"city_easter_egg_pixeldebh": {
			"id": "city_easter_egg_pixeldebh",
			"name": "Strano Ritrovamento Metallico",
			"type": 5,  # SPECIAL
			"description": "Rovistando tra detriti metallici e cemento sbriciolato, noti uno strano oggetto lucido. Una placca argentata con un simbolo insolito e la scritta parzialmente leggibile 'PixelDebh'.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Raccogliere la placca",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Raccogli la placca misteriosa. Potrebbe essere un oggetto da collezione di tempi migliori.",
						"rewards": {"items": {"scrap_metal": 1, "lore_fragment": 1}}
					}
				},
				{
					"text": "Lasciarla lì",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi di lasciare la placca dove l'hai trovata. Forse ha un significato per qualcun altro.",
						"rewards": {}
					}
				}
			]
		},
		
		"city_unique_webradio": {
			"id": "city_unique_webradio",
			"name": "Studio Radio Silenzioso",
			"type": 5,  # SPECIAL
			"description": "Una stanza devastata: pareti annerite, macerie, monitor infranti su un tavolo circolare. Un'insegna sbrecciata sul muro recita 'R...me...adi'. Qui un tempo pulsava una WebRadio, voce libera ora ridotta al silenzio.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare attrezzature (Tracce)",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Tra i detriti trovi componenti elettronici ancora funzionanti e cavi utilizzabili.",
							"rewards": {"items": {"mechanical_parts": 2, "scrap_metal": 1, "lore_fragment": 1}}
						},
						"failure": {
							"text": "Tutto è troppo danneggiato per essere recuperato. Solo silenzio e polvere.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Osservare in silenzio",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Ti fermi a contemplare questo simbolo di libertà perduta. Un momento di riflessione in un mondo distrutto.",
						"rewards": {}
					}
				}
			]
		},

		"city_medical_supply": {
			"id": "city_medical_supply",
			"name": "Farmacia Saccheggiata",
			"type": 0,  # LOCATION_SPECIFIC
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
		},
		
		"city_teen_gang_territory": {
			"id": "city_teen_gang_territory",
			"name": "Territorio di Banda Giovanile",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Graffiti colorati segnano questo quartiere come territorio di una banda di ragazzi sopravvissuti. Simboli minacciosi ma anche disegni che rivelano la loro giovane età. Segnali contrastanti di pericolo e di possibilità di contatto.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Tentare un contatto (Influenza)",
					"requirements": {"influenza": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "influenza",
						"difficulty": 13,
						"success": {
							"text": "Dopo un teso confronto iniziale, riesci a guadagnarti la fiducia del gruppo. Ti offrono una balestra semplice e qualche dardo.",
							"rewards": {"items": {"crossbow_simple": 1, "ammo_bolt": 3}}
						},
						"failure": {
							"text": "Un fischio acuto risuona tra gli edifici. Sagome si muovono come ombre. 'Questo non è territorio tuo,' grida una voce giovane. Indietreggi lentamente, sentendoti osservato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Studiare i loro nascondigli (Tracce)",
					"requirements": {"tracce": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 14,
						"success": {
							"text": "Evitando di farti notare, scopri uno dei loro depositi. Prendi cibo, acqua e qualche risorsa.",
							"rewards": {"items": {"canned_food": 2, "water_bottle": 1, "scrap_metal": 1, "ammo_generic": 5}}
						},
						"failure": {
							"text": "Un suono metallico scatta vicino al tuo piede. Una trappola rudimentale ma efficace. Un avvertimento. Allontanati rapidamente, sentendoti fortunato.",
							"rewards": {}
						}
					}
				},
				{
					"text": "Evitare la zona",
					"requirements": {},
					"consequences": {
						"action": "simple_result",
						"text": "Decidi che non vale la pena rischiare un confronto. Ti allontani discretamente dalla zona.",
						"rewards": {}
					}
				}
			]
		},
		
		"city_devastated_library": {
			"id": "city_devastated_library",
			"name": "Biblioteca Devastata",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Una biblioteca un tempo maestosa ora giace in rovina. Scaffali rovesciati e libri carbonizzati ricoprono il pavimento come foglie morte.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare tra i libri sopravvissuti (Presagio)",
					"requirements": {"presagio": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 11,
						"success": {
							"text": "Tra le ceneri trovi alcuni volumi sopravvissuti e frammenti di conoscenza preziosa.",
							"rewards": {"items": {"lore_fragment": 2, "vitamins": 1}}
						},
						"failure": {
							"text": "Solo cenere e carta bruciata. La conoscenza di un'era è andata perduta per sempre.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_abandoned_subway": {
			"id": "city_abandoned_subway",
			"name": "Metropolitana Abbandonata",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "L'ingresso di una stazione della metropolitana è bloccato da detriti. L'aria che filtra è stagnante e carica di pericolo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esplorare i tunnel (Tracce)",
					"requirements": {"tracce": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 13,
						"success": {
							"text": "Navigando con cautela nei tunnel bui, scopri un rifugio improvvisato con provviste abbandonate.",
							"rewards": {"items": {"ration_pack": 2, "water_bottle": 1, "rope": 1}}
						},
						"failure": {
							"text": "I tunnel sono troppo pericolosi e confusi. Meglio non rischiare di perdersi nel buio.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_unstable_skyscraper": {
			"id": "city_unstable_skyscraper",
			"name": "Grattacielo Instabile",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un grattacielo pende pericolosamente, sostenuto solo da travature contorte. Dentro potrebbero esserci tesori, ma il rischio è estremo.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Entrare con cautela (Agilità)",
					"requirements": {"agilita": 14},
					"consequences": {
						"action": "skill_check",
						"stat": "agilita",
						"difficulty": 14,
						"success": {
							"text": "Con movimenti precisi eviti i detriti che cadono e raggiungi un ufficio con materiali preziosi.",
							"rewards": {"items": {"mechanical_parts": 2, "scrap_metal": 3}}
						},
						"failure": {
							"text": "Un pezzo di cemento si stacca e ti colpisce. Fuggi dall'edificio prima che crolli completamente.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_ghost_market": {
			"id": "city_ghost_market",
			"name": "Mercato Fantasma",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Bancarelle rovesciate e mercanzie sparse creano un labirinto di opportunità e pericoli. L'aria sa di cibo marcio e disperazione.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Rovistare tra le bancarelle (Adattamento)",
					"requirements": {"adattamento": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 12,
						"success": {
							"text": "Sopportando l'odore nauseabondo, trovi cibo ancora commestibile e oggetti utili.",
							"rewards": {"items": {"canned_food": 2, "cloth_rags": 2}}
						},
						"failure": {
							"text": "L'odore è troppo forte e tutto sembra contaminato. Meglio cercare altrove.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_military_vehicle": {
			"id": "city_military_vehicle",
			"name": "Veicolo Militare Abbandonato",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un veicolo corazzato militare è bloccato tra i detriti. Le portiere sono aperte e l'interno potrebbe nascondere equipaggiamento utile.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Ispezionare il veicolo (Tracce)",
					"requirements": {"tracce": 12},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 12,
						"success": {
							"text": "Nell'abitacolo trovi munizioni militari e un kit di pronto soccorso dell'esercito.",
							"rewards": {"items": {"ammo_rifle": 5, "first_aid_kit": 1, "military_ration": 1}}
						},
						"failure": {
							"text": "Il veicolo è stato già completamente svuotato. Solo sedili strappati e vetri rotti.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_silent_hospital": {
			"id": "city_silent_hospital",
			"name": "Ospedale Silenzioso",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un ospedale abbandonato si erge minaccioso. Le finestre rotte guardano come occhi vuoti, e il silenzio è innaturale.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare farmaci (Adattamento)",
					"requirements": {"adattamento": 15},
					"consequences": {
						"action": "skill_check",
						"stat": "adattamento",
						"difficulty": 15,
						"success": {
							"text": "Ignorando l'atmosfera inquietante, trovi medicine di valore in una farmacia nascosta.",
							"rewards": {"items": {"medicine_advanced": 2, "bandages_sterile": 3}}
						},
						"failure": {
							"text": "L'atmosfera è troppo opprimente. Senti presenza invisibili e fuggi senza guardare indietro.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_propaganda_posters": {
			"id": "city_propaganda_posters",
			"name": "Manifesti di Propaganda",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Muri ricoperti di manifesti strappati del governo precedente. Volti sorridenti in un mondo che non esiste più.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Leggere i manifesti (Presagio)",
					"requirements": {"presagio": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 10,
						"success": {
							"text": "Tra le righe della propaganda scopri indizi su bunker e rifugi governativi nascosti.",
							"rewards": {"items": {"map_fragment": 1, "lore_fragment": 1}}
						},
						"failure": {
							"text": "Solo bugie e promesse vuote. La verità è sepolta sotto strati di menzogne.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_overgrown_park": {
			"id": "city_overgrown_park",
			"name": "Parco Invaso dalla Vegetazione",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un parco cittadino è stato completamente riconquistato dalla natura. Rampicanti coprono statue e panchine.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Cercare tra la vegetazione (Tracce)",
					"requirements": {"tracce": 11},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 11,
						"success": {
							"text": "Nascosti tra le radici trovi oggetti dimenticati dai visitatori di un tempo.",
							"rewards": {"items": {"berries": 3, "cloth_rags": 1, "rope": 1}}
						},
						"failure": {
							"text": "La vegetazione è troppo fitta e nasconde troppi pericoli. Meglio rimanere sui sentieri.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_sewer_sounds": {
			"id": "city_sewer_sounds",
			"name": "Suoni dalle Fogne",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Da un tombino aperto provengono suoni inquietanti. Rumori di qualcosa che si muove nelle profondità urbane.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Investigare i suoni (Presagio)",
					"requirements": {"presagio": 13},
					"consequences": {
						"action": "skill_check",
						"stat": "presagio",
						"difficulty": 13,
						"success": {
							"text": "Il tuo istinto ti suggerisce che i suoni sono innocui. Scendendo trovi un nascondiglio con provviste.",
							"rewards": {"items": {"water_purified": 2, "ration_pack": 1}}
						},
						"failure": {
							"text": "I suoni diventano più minacciosi. Qualcosa si avvicina velocemente dal buio. Fuggi chiudendo il tombino.",
							"rewards": {}
						}
					}
				}
			]
		},
		
		"city_intact_apartment": {
			"id": "city_intact_apartment",
			"name": "Appartamento Intatto",
			"type": 0,  # LOCATION_SPECIFIC
			"description": "Un appartamento miracolosamente intatto in un edificio semidistrutto. La porta è socchiusa, rivelando interni preservati.",
			"image": "",
			"conditions": {},
			"choices": [
				{
					"text": "Esplorare l'appartamento (Tracce)",
					"requirements": {"tracce": 10},
					"consequences": {
						"action": "skill_check",
						"stat": "tracce",
						"difficulty": 10,
						"success": {
							"text": "Nell'appartamento trovi una vita interrotta: cibo in dispensa, vestiti puliti e oggetti personali.",
							"rewards": {"items": {"canned_food": 3, "clean_clothes": 1, "vitamins": 2}}
						},
						"failure": {
							"text": "L'appartamento sembra intatto, ma c'è qualcosa di inquietante nell'aria. Meglio non disturbare.",
							"rewards": {}
						}
					}
				}
			]
		}
	} 

func city_patrol_1():
	var event = {
		"id": "city_patrol_1",
		"text": "Mentre pattuglia le strade della città, scorgi un gruppo di banditi che si avvicina a un mercante. Le loro intenzioni sono chiaramente ostili. Hai pochi secondi per decidere come agire.",
		"location": "city",
		"choices": [
			"Intervieni immediatamente",
			"Osserva nascosto",
			"Allontanati silenziosamente"
		]
	}
	return event

func trade_merchant_good():
	var event = {
		"id": "trade_merchant_good",
		"text": "Un mercante esperto ti offre la sua merce migliore. I suoi occhi brillano mentre mostra armi e strumenti di qualità superiore. Potresti trovare qui quello che cerchi, ma i prezzi non sono modesti.",
		"location": "market",
		"choices": [
			"Esamina le armi",
			"Guarda gli strumenti",
			"Chiedi informazioni",
			"Ringrazia e vai via"
		]
	}
	return event

func duplicate_patrol():
	var event = {
		"id": "duplicate_patrol",
		"text": "Mentre pattuglia le strade della città, scorgi un gruppo di banditi che si avvicina a un mercante. Le loro intenzioni sono ostili.",
		"location": "city",
		"choices": [
			"Intervieni",
			"Osserva",
			"Vai via"
		]
	}
	return event

func plains_bones():
	var event = {
		"id": "plains_bones",
		"text": "Ossa nella Polvere - Ossa sbiancate dal sole, forse umane, affiorano dal terreno screpolato. Un macabro segnale della fragilità della vita qui.",
		"location": "plains",
		"choices": [
			"Ispeziona le ossa (Tracce)",
			"Cerca indizi sulla causa della morte (Presagio)",
			"Lascia riposare i morti (Ignora)"
		]
	}
	return event

func plains_carcass():
	var event = {
		"id": "plains_carcass",
		"text": "Banchetto Funebre - Una carcassa gonfia di animale non identificabile giace sotto il sole implacabile, divorata da sciami di insetti ronzanti. L'odore è nauseante.",
		"location": "plains",
		"choices": [
			"Avvicinati con cautela (Adattamento)",
			"Ispeziona da lontano (Presagio)",
			"Ignora e prosegui"
		]
	}
	return event

func plains_youth_memory():
	var event = {
		"id": "plains_youth_memory",
		"text": "Frammenti d'Infanzia - Un vecchio parco giochi arrugginito emerge dalla sabbia. Altalene contorte cigolano nel vento. Per un attimo, ricordi com'era essere solo un bambino, senza il peso della sopravvivenza.",
		"location": "{ id",
		"choices": [
			"Esplorare i resti (Presagio)"
		]
	}
	return event

func plains_lonely_flower():
	var event = {
		"id": "plains_lonely_flower",
		"text": "Fiore Solitario - In mezzo all'aridità, un singolo, tenace fiore di un colore innaturalmente vivido lotta per la sopravvivenza. È un piccolo, strano segno di vita in questo nulla.",
		"location": "{ id",
		"choices": [
			"Osservare da vicino (Presagio)"
		]
	}
	return event

func plains_rusty_sign():
	var event = {
		"id": "plains_rusty_sign",
		"text": "Cartello Arrugginito - Un vecchio cartello stradale, piegato e corroso dalla ruggine, emerge a malapena dal terreno. Le scritte sono quasi illeggibili, ma forse indica qualcosa di importante... o di pericoloso.",
		"location": "{ id",
		"choices": [
			"Decifrare le scritte (Adattamento)"
		]
	}
	return event

func plains_dust_devil():
	var event = {
		"id": "plains_dust_devil",
		"text": "Diavolo di Polvere - Un piccolo ma intenso turbine di polvere e detriti si forma improvvisamente davanti a te, danzando sulla pianura.",
		"location": "{ text",
		"choices": [
			"Attraversare rapidamente (Agilità)"
		]
	}
	return event

func plains_mirage():
	var event = {
		"id": "plains_mirage",
		"text": "Miraggio Ingannevole - In lontananza, sotto il sole cocente, vedi quella che sembra un'oasi: acqua scintillante e vegetazione lussureggiante. Potrebbe essere reale, o un crudele scherzo della tua mente affaticata.",
		"location": "{ text",
		"choices": [
			"Avvicinarsi con cautela (Presagio)"
		]
	}
	return event

func plains_fallen_scavenger():
	var event = {
		"id": "plains_fallen_scavenger",
		"text": "Saccheggiatore Caduto - Trovi il corpo di un altro sventurato, evidentemente un saccheggiatore, morto da poco. Il suo zaino è semiaperto.",
		"location": "{ text",
		"choices": [
			"Frugare nello zaino (Tracce)"
		]
	}
	return event

func plains_burned_patch():
	var event = {
		"id": "plains_burned_patch",
		"text": "Chiazza Bruciata - Un'ampia zona di terreno è annerita e vetrificata, come se qualcosa di estremamente caldo fosse esploso o caduto qui. Al centro, qualcosa luccica debolmente.",
		"location": "{ text",
		"choices": [
			"Avvicinarsi al centro (Adattamento)"
		]
	}
	return event

func plains_whispers_wind():
	var event = {
		"id": "plains_whispers_wind",
		"text": "Sussurri nel Vento - Il vento sembra trasportare voci distorte e frammenti di melodie dimenticate. Stai impazzendo o c'è qualcos'altro là fuori?",
		"location": "{ text",
		"choices": [
			"Concentrarsi sui suoni (Presagio)"
		]
	}
	return event

func plains_old_well():
	var event = {
		"id": "plains_old_well",
		"text": "Vecchio Pozzo Secco - Ti imbatti in un vecchio pozzo di pietra, chiaramente in disuso da decenni. La carrucola è arrugginita e non c'è traccia di una corda.",
		"location": "{ text",
		"choices": [
			"Guardare all'interno (Tracce)"
		]
	}
	return event

func plains_scrap_pile():
	var event = {
		"id": "plains_scrap_pile",
		"text": "Cumulo di Rottami - Un ammasso contorto di metallo arrugginito, plastica fusa e altri detriti irriconoscibili. Potrebbe nascondere qualcosa di utile o solo taglienti sorprese.",
		"location": "{ text",
		"choices": [
			"Frugare con attenzione (Adattamento)"
		]
	}
	return event

func plains_traveler_tracks():
	var event = {
		"id": "plains_traveler_tracks",
		"text": "Tracce di un Viandante Solitario - Noti delle impronte chiare e recenti che attraversano la pianura. Appartengono a una singola persona, che sembrava muoversi con uno scopo.",
		"location": "{ text",
		"choices": [
			"Seguire le tracce (Tracce)"
		]
	}
	return event

func forest_noises():
	var event = {
		"id": "forest_noises",
		"text": "Fruscio nel Sottobosco - Il silenzio innaturale della foresta è rotto da un fruscio sospetto tra i cespugli. Animale... o qualcos'altro? Indagare potrebbe essere rischioso.",
		"location": "forest",
		"choices": [
			"Indaga furtivamente (Tracce)"
		]
	}
	return event

func forest_fallen_tree():
	var event = {
		"id": "forest_fallen_tree",
		"text": "Tronco Annerito - Un albero enorme, sradicato e con la corteccia stranamente annerita, blocca il sentiero. Scavalcarlo sembra difficile, aggirarlo richiede tempo.",
		"location": "forest",
		"choices": [
			"Tenta di scavalcare (Agilità)"
		]
	}
	return event

func forest_hostile_flora():
	var event = {
		"id": "forest_hostile_flora",
		"text": "Rovi Aggressivi - Rampicanti spinosi dall'aspetto malato e aggressivo ostruiscono il passaggio. Sembrano quasi contrarsi al tuo avvicinarsi. Nascondono qualcosa o sono solo un altro pericolo?",
		"location": "forest",
		"choices": [
			"Esamina i rovi (Adattamento)"
		]
	}
	return event

func forest_teen_shelter():
	var event = {
		"id": "forest_teen_shelter",
		"text": "Rifugio tra gli Alberi - Una casa sull'albero malconcia, costruita prima del Crollo, si nasconde tra i rami nodosi. Scale improvvisate di corda danneggiate pendono fino a terra. Potrebbe essere stata il nascondiglio di qualcuno della tua età.",
		"location": "forest",
		"choices": [
			"Arrampicarsi (Agilità)"
		]
	}
	return event

func forest_sacrificial_tree():
	var event = {
		"id": "forest_sacrificial_tree",
		"text": "Albero Sacrificale - Un albero antico e imponente si erge al centro di una piccola radura. Attorno al suo tronco sono legati strani feticci fatti di ossa, stracci e metallo arrugginito. Emana un'aura inquietante.",
		"location": "{ text",
		"choices": [
			"Esaminare i feticci (Presagio)"
		]
	}
	return event

func forest_distant_songs():
	var event = {
		"id": "forest_distant_songs",
		"text": "Eco di Canti Lontani - Tra il fruscio delle foglie, ti sembra di udire l'eco sommesso di un canto o una melodia malinconica provenire dalle profondità della foresta.",
		"location": "{ text",
		"choices": [
			"Seguire il suono (Tracce)"
		]
	}
	return event

func forest_hunter_trap():
	var event = {
		"id": "forest_hunter_trap",
		"text": "Trappola del Cacciatore Dimenticata - Scorgi una vecchia trappola per animali, forse un grosso tagliola o un laccio, parzialmente nascosta dalle foglie. Sembra ancora armata.",
		"location": "{ text",
		"choices": [
			"Disarmare la trappola (Adattamento)"
		]
	}
	return event

func forest_symbiotic_plant():
	var event = {
		"id": "forest_symbiotic_plant",
		"text": "Simbionte Vegetale - Un cadavere di animale è completamente avvolto da una strana muffa o fungo luminescente che pulsa debolmente. La pianta sembra aver consumato e integrato la creatura.",
		"location": "{ text",
		"choices": [
			"Prelevare un campione (Adattamento)"
		]
	}
	return event

func forest_hidden_path():
	var event = {
		"id": "forest_hidden_path",
		"text": "Sentiero Nascosto - Noti un sentiero appena percettibile che si inoltra nel fitto della boscaglia, quasi invisibile a un occhio inesperto. Chissà dove conduce.",
		"location": "{ text",
		"choices": [
			"Seguire il sentiero (Tracce)"
		]
	}
	return event

func forest_whispering_tree():
	var event = {
		"id": "forest_whispering_tree",
		"text": "L'Albero dei Sussurri - Un albero cavo e contorto sembra emettere strani sussurri quando il vento ci passa attraverso. Alcuni dicono che questi alberi custodiscano segreti o attirino spiriti.",
		"location": "{ text",
		"choices": [
			"Ascoltare i sussurri (Presagio)"
		]
	}
	return event

func forest_camouflaged_predator():
	var event = {
		"id": "forest_camouflaged_predator",
		"text": "Predatore Mimetizzato - Hai la netta sensazione di essere osservato. Tra il fogliame, qualcosa si muove, perfettamente mimetizzato con l'ambiente.",
		"location": "{ text",
		"choices": [
			"Attacco preventivo (Potenza)"
		]
	}
	return event

func forest_contaminated_spring():
	var event = {
		"id": "forest_contaminated_spring",
		"text": "Fonte Contaminata - Trovi una piccola sorgente d'acqua cristallina, un vero miraggio. Tuttavia, le piante intorno ad essa sono stranamente ingiallite e malate.",
		"location": "{ text",
		"choices": [
			"Raccogliere l'acqua (Adattamento)"
		]
	}
	return event

func forest_silent_grove():
	var event = {
		"id": "forest_silent_grove",
		"text": "Il Bosco Silenzioso - Entri in una parte della foresta dove ogni suono sembra attutito. Non ci sono canti di uccelli, né il ronzio di insetti. Solo un silenzio innaturale e pesante.",
		"location": "{ text",
		"choices": [
			"Procedere con cautela (Tracce)"
		]
	}
	return event

func forest_exposed_roots():
	var event = {
		"id": "forest_exposed_roots",
		"text": "Radici Esposte - Un grosso albero è caduto, esponendo un intricato sistema di radici. Tra di esse, potresti trovare qualcosa di interessante o rimanere intrappolato.",
		"location": "{ text",
		"choices": [
			"Frugare tra le radici (Adattamento)"
		]
	}
	return event

func river_flow():
	var event = {
		"id": "river_flow",
		"text": "Corrente Lenta e Torbida - L'acqua del fiume scorre pigra e innaturalmente torbida, trascinando detriti irriconoscibili. La puzza leggera suggerisce contaminazione. Raccoglierla è un rischio.",
		"location": "river",
		"choices": [
			"Riempi la borraccia (Rischioso)"
		]
	}
	return event

func river_youth_reflection():
	var event = {
		"id": "river_youth_reflection",
		"text": "Riflessi nell'Acqua Torbida - La corrente lenta del fiume crea una superficie quasi calma. Ti sporgi per riempire la borraccia e intravedi il tuo riflesso: un volto giovane segnato da esperienze che nessun diciassettenne dovrebbe affrontare. Questo mondo ti ha trasformato.",
		"location": "{ text",
		"choices": [
			"Fermarsi a riposare (Vigore)"
		]
	}
	return event

func river_stranded_wreck():
	var event = {
		"id": "river_stranded_wreck",
		"text": "Relitto Incagliato - Lo scheletro arrugginito di una piccola imbarcazione o di un veicolo anfibio è incagliato sulla riva o su un banco di sabbia al centro del fiume torbido.",
		"location": "{ text",
		"choices": [
			"Raggiungere il relitto (Agilità)"
		]
	}
	return event

func river_mutated_fish():
	var event = {
		"id": "river_mutated_fish",
		"text": "Pesci Mutati - Vedi dei pesci dalle forme strane e dai colori innaturali nuotare vicino alla superficie. Alcuni sono grossi, altri hanno troppi occhi o pinne deformi.",
		"location": "{ text",
		"choices": [
			"Tentare di pescare (Adattamento)"
		]
	}
	return event

func river_floating_debris():
	var event = {
		"id": "river_floating_debris",
		"text": "Oggetti Trasportati dalla Corrente - La corrente del fiume trasporta lentamente detriti di ogni tipo: plastica, legno, a volte contenitori sigillati o frammenti di qualcosa di più grande.",
		"location": "{ text",
		"choices": [
			"Afferrare gli oggetti (Agilità)"
		]
	}
	return event

func river_collapsed_bridge():
	var event = {
		"id": "river_collapsed_bridge",
		"text": "Il Ponte Crollato - I resti di un ponte crollato attraversano il fiume. Alcune sezioni sono sommerse, altre emergono come isole di cemento e acciaio contorto.",
		"location": "{ text",
		"choices": [
			"Attraversare sui resti (Agilità)"
		]
	}
	return event

func river_water_whispers():
	var event = {
		"id": "river_water_whispers",
		"text": "Sussurri dall'Acqua - Avvicinandoti alla riva, ti sembra di sentire dei sussurri o dei lamenti provenire dalla superficie dell'acqua torbida, come se qualcuno fosse intrappolato sotto.",
		"location": "{ text",
		"choices": [
			"Chiamare per rispondere (Influenza)"
		]
	}
	return event

func river_dangerous_rapids():
	var event = {
		"id": "river_dangerous_rapids",
		"text": "Rapide Pericolose - Il fiume si restringe e la corrente accelera, formando piccole rapide rumorose e piene di rocce affioranti. Attraversare qui sarebbe molto rischioso.",
		"location": "{ text",
		"choices": [
			"Cercare un guado (Tracce)"
		]
	}
	return event

func river_collapsed_bank():
	var event = {
		"id": "river_collapsed_bank",
		"text": "Argine Franato - Un tratto dell'argine del fiume è franato, creando una parete di fango instabile e rivelando strati di terra e detriti sepolti.",
		"location": "{ text",
		"choices": [
			"Esaminare la frana (Tracce)"
		]
	}
	return event

func river_amphibian_nests():
	var event = {
		"id": "river_amphibian_nests",
		"text": "Nidi sulle Rive - Lungo le rive fangose, noti numerosi nidi o tane di creature anfibie o semi-acquatiche. Alcuni sembrano occupati.",
		"location": "{ text",
		"choices": [
			"Cercare uova (Adattamento)"
		]
	}
	return event

func river_inaccessible_island():
	var event = {
		"id": "river_inaccessible_island",
		"text": "L'Isolotto Inaccessibile - Al centro del fiume, un piccolo isolotto verdeggiante sembra un'oasi di pace. Raggiungerlo, però, richiederebbe di attraversare la corrente forte e l'acqua sospetta.",
		"location": "{ text",
		"choices": [
			"Costruire un ponte (Adattamento)"
		]
	}
	return event

func river_message_bottle():
	var event = {
		"id": "river_message_bottle",
		"text": "Il Messaggio nella Bottiglia - Incagliata tra i detriti sulla riva, noti una vecchia bottiglia sigillata. All'interno sembra esserci un pezzo di carta arrotolato.",
		"location": "{ text",
		"choices": [
			"Aprire la bottiglia (Adattamento)"
		]
	}
	return event

func village_forgotten_altar():
	var event = {
		"id": "village_forgotten_altar",
		"text": "Altare Dimenticato - In una delle baracche meno diroccate, trovi un piccolo altare improvvisato con oggetti strani e simboli scarabocchiati. Sembra un tentativo di placare qualche divinità sconosciuta.",
		"location": "{ text",
		"choices": [
			"Lasciare un'offerta"
		]
	}
	return event

func village_lonely_toy():
	var event = {
		"id": "village_lonely_toy",
		"text": "Giocattolo Solitario - Un giocattolo rotto e sporco – una bambola senza un occhio, un soldatino di piombo – giace abbandonato in mezzo alla polvere di una soglia. Un triste promemoria dei bambini che un tempo vivevano qui.",
		"location": "{ text",
		"choices": [
			"Raccogliere il giocattolo"
		]
	}
	return event

func village_empty_square():
	var event = {
		"id": "village_empty_square",
		"text": "Il Silenzio della Piazza - Raggiungi quella che un tempo doveva essere la piazza del villaggio. Ora è vuota, con solo il vento che solleva foglie secche. Un silenzio carico di attesa grava sul luogo.",
		"location": "{ text",
		"choices": [
			"Attraversare rapidamente"
		]
	}
	return event

func village_last_message():
	var event = {
		"id": "village_last_message",
		"text": "L'Ultimo Messaggio - Su un muro sbrecciato, qualcuno ha scritto un breve messaggio con del carbone o vernice sbiadita: un nome, un avvertimento, una preghiera.",
		"location": "{ text",
		"choices": [
			"Decifrare il messaggio (Adattamento)"
		]
	}
	return event

func village_rancid_smell():
	var event = {
		"id": "village_rancid_smell",
		"text": "Odore di Cibo Rancido - Un debole odore di cibo andato a male proviene da una delle abitazioni. Potrebbe esserci qualcosa di commestibile rimasto, o solo parassiti.",
		"location": "{ text",
		"choices": [
			"Investigare la fonte (Adattamento)"
		]
	}
	return event

func village_rusty_tools():
	var event = {
		"id": "village_rusty_tools",
		"text": "Strumenti Agricoli Rugginiti - Appoggiati a un muro crollato, trovi vecchi attrezzi agricoli: una zappa, una falce, un forcone, tutti consumati dalla ruggine.",
		"location": "{ text",
		"choices": [
			"Riparare uno strumento (Adattamento)"
		]
	}
	return event

func village_well():
	var event = {
		"id": "village_well",
		"text": "Il Pozzo del Villaggio - Al centro del villaggio si trova un pozzo di pietra. Sembra profondo, e non sai se l'acqua sul fondo sia potabile o se ci sia ancora acqua.",
		"location": "{ text",
		"choices": [
			"Calare un secchio (Adattamento)"
		]
	}
	return event

func village_hanging_clothes():
	var event = {
		"id": "village_hanging_clothes",
		"text": "Vestiti Stesi - Sorprendentemente, su un filo teso tra due pali, ci sono dei vestiti logori stesi ad asciugare. Qualcuno è stato qui di recente, o li ha dimenticati.",
		"location": "{ text",
		"choices": [
			"Prendere i vestiti"
		]
	}
	return event

func village_scarecrow():
	var event = {
		"id": "village_scarecrow",
		"text": "Il Guardiano Silenzioso - Uno spaventapasseri sbrindellato se ne sta ancora in piedi in quello che un tempo era un orto. I suoi occhi di bottone sembrano seguirti.",
		"location": "{ text",
		"choices": [
			"Ispezionare lo spaventapasseri (Tracce)"
		]
	}
	return event

func village_echo_laughter():
	var event = {
		"id": "village_echo_laughter",
		"text": "Eco di Risate - Per un fugace istante, ti sembra di sentire l'eco di risate infantili provenire da una delle case vuote. Un brivido ti corre lungo la schiena.",
		"location": "{ text",
		"choices": [
			"Investigare la casa (Presagio)"
		]
	}
	return event

func city_shadows():
	var event = {
		"id": "city_shadows",
		"text": "Ombre tra i Grattacieli - Scheletri di grattacieli graffiano il cielo plumbeo. Il vento fischia tra le finestre rotte come un lamento. Pericolo e tesori dimenticati si nascondono in ogni angolo.",
		"location": "city",
		"choices": [
			"Esplora un palazzo (Presagio)"
		]
	}
	return event

func city_medical_supply():
	var event = {
		"id": "city_medical_supply",
		"text": "Farmacia Saccheggiata - Le insegne sbiadite di una farmacia. Dentro, scaffali rovesciati e blister vuoti ovunque. Forse è rimasto qualcosa di utile tra il disastro.",
		"location": "city",
		"choices": [
			"Cerca medicine (Adattamento)"
		]
	}
	return event

func city_teen_gang_territory():
	var event = {
		"id": "city_teen_gang_territory",
		"text": "Territorio di Banda Giovanile - Graffiti colorati segnano questo quartiere come territorio di una banda di ragazzi sopravvissuti. Simboli minacciosi ma anche disegni che rivelano la loro giovane età. Segnali contrastanti di pericolo e di possibilità di contatto.",
		"location": "city",
		"choices": [
			"Tentare un contatto (Influenza)"
		]
	}
	return event

func city_devastated_library():
	var event = {
		"id": "city_devastated_library",
		"text": "Biblioteca Devastata - Entri in quella che un tempo era una biblioteca pubblica. Scaffali rovesciati, libri ammuffiti e pagine strappate coprono il pavimento. Forse qualche conoscenza è sopravvissuta.",
		"location": "{ text",
		"choices": [
			"Cercare libri utili (Adattamento)"
		]
	}
	return event

func city_abandoned_subway():
	var event = {
		"id": "city_abandoned_subway",
		"text": "Metropolitana Abbandonata - Le scale mobili arrugginite conducono verso il basso, nell'oscurità di una stazione della metropolitana. L'aria è viziata e si sentono strani rumori provenire dalle gallerie.",
		"location": "{ text",
		"choices": [
			"Esplorare i tunnel (Tracce)"
		]
	}
	return event

func city_unstable_skyscraper():
	var event = {
		"id": "city_unstable_skyscraper",
		"text": "Grattacielo Instabile - Un grattacielo pende pericolosamente, sostenuto solo da travature contorte. Dentro potrebbero esserci tesori, ma il rischio è estremo.",
		"location": "{ text",
		"choices": [
			"Salire ai piani alti (Agilità)"
		]
	}
	return event

func city_ghost_market():
	var event = {
		"id": "city_ghost_market",
		"text": "Mercato Fantasma - Ti imbatti in una serie di bancarelle improvvisate e ormai deserte, nascoste in un vicolo. Sembra un vecchio mercato nero. Qualcosa di valore potrebbe essere stato dimenticato.",
		"location": "{ text",
		"choices": [
			"Frugare nelle bancarelle (Tracce)"
		]
	}
	return event

func city_military_vehicle():
	var event = {
		"id": "city_military_vehicle",
		"text": "Veicolo Militare Abbandonato - Un veicolo corazzato militare è bloccato tra i detriti. Le portiere sono aperte e l'interno potrebbe nascondere equipaggiamento utile.",
		"location": "{ text",
		"choices": [
			"Ispezionare il veicolo (Tracce)"
		]
	}
	return event

func city_silent_hospital():
	var event = {
		"id": "city_silent_hospital",
		"text": "Ospedale Silenzioso - Le porte di un grande ospedale cittadino sono divelte. Dentro, il silenzio è rotto solo dal gocciolio dell'acqua e dal vento che sibila tra i corridoi bui.",
		"location": "{ text",
		"choices": [
			"Cercare farmaci (Adattamento)"
		]
	}
	return event

func city_propaganda_posters():
	var event = {
		"id": "city_propaganda_posters",
		"text": "Manifesti di Propaganda - Sui muri scrostati, resti di vecchi manifesti di propaganda promettono un futuro radioso che non è mai arrivato, o minacciano nemici ormai dimenticati.",
		"location": "{ text",
		"choices": [
			"Studiare i manifesti (Presagio)"
		]
	}
	return event

func city_overgrown_park():
	var event = {
		"id": "city_overgrown_park",
		"text": "Parco Invaso dalla Vegetazione - Un parco cittadino è stato completamente riconquistato dalla natura. Rampicanti coprono statue e panchine.",
		"location": "{ text",
		"choices": [
			"Cercare tra la vegetazione (Tracce)"
		]
	}
	return event

func city_sewer_sounds():
	var event = {
		"id": "city_sewer_sounds",
		"text": "Suoni dalle Fogne - Da un tombino aperto provengono suoni inquietanti. Rumori di qualcosa che si muove nelle profondità urbane.",
		"location": "{ text",
		"choices": [
			"Investigare i suoni (Presagio)"
		]
	}
	return event

func city_intact_apartment():
	var event = {
		"id": "city_intact_apartment",
		"text": "Appartamento Intatto - Incredibilmente, trovi un appartamento in un palazzo diroccato che sembra quasi intatto, come se i suoi occupanti fossero appena usciti. Polvere ovunque, ma mobili e oggetti personali sono al loro posto.",
		"location": "{ text",
		"choices": [
			"Saccheggiare con cura (Tracce)"
		]
	}
	return event

func rest_stop_day_interaction():
	var event = {
		"id": "rest_stop_day_interaction",
		"text": "Rifugio Diurno - Questo posto sembra tranquillo alla luce del giorno. Potrebbe essere un buon momento per riorganizzarsi o cercare meglio.",
		"location": "rest_stop",
		"choices": [
			"Cerca Provviste (Tracce)"
		]
	}
	return event

func rest_stop_shelter():
	var event = {
		"id": "rest_stop_shelter",
		"text": "Riparo Improvvisato - Un piccolo rifugio, forse una vecchia stazione di servizio o un capanno abbandonato. Offre una tregua momentanea dal mondo esterno.",
		"location": "rest_stop",
		"choices": [
			"Fruga tra le provviste (Tracce)"
		]
	}
	return event

func rest_stop_vehicle():
	var event = {
		"id": "rest_stop_vehicle",
		"text": "Veicolo Abbandonato - Un'auto arrugginita o un furgone bloccato sul ciglio della strada. Potrebbe contenere qualcosa di utile, o solo brutte sorprese.",
		"location": "rest_stop",
		"choices": [
			"Controlla il bagagliaio (Potenza)"
		]
	}
	return event

func rest_stop_old_camp():
	var event = {
		"id": "rest_stop_old_camp",
		"text": "Vecchio Accampamento - I resti di un accampamento frettolosamente abbandonato. Ceneri fredde di un falò, una tenda strappata che sventola al vento. Chissà cosa è successo.",
		"location": "rest_stop",
		"choices": [
			"Ispeziona i resti del fuoco (Tracce)"
		]
	}
	return event

func rest_stop_hidden_stash():
	var event = {
		"id": "rest_stop_hidden_stash",
		"text": "Scorta Nascosta - Sembra che qualcuno abbia usato questo posto come nascondiglio temporaneo. Forse hanno lasciato qualcosa di utile.",
		"location": "rest_stop",
		"choices": [
			"Cerca attentamente (Presagio)"
		]
	}
	return event

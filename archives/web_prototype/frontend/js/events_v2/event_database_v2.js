/**
 * THE SAFE PLACE - EVENT ENGINE V2.0
 * Event Database - Database eventi narrativi complessi
 * FASE 5 STEP 2A: Sistema Eventi Narrativi Avanzati
 */

const EVENT_DATABASE_V2 = {
    
    // === CATEGORY: ENVIRONMENTAL STORY EVENTS ===
    environmental: {
        
        "abandoned_laboratory": {
            id: "abandoned_laboratory",
            title: "Laboratorio Abbandonato",
            description: "I vetri infranti riflettono i tuoi passi. All'interno, terminali ancora accesi pulsano nell'oscurità...",
            category: "environmental",
            tier: 2,
            priority: 7,
            unique: true,
            
            triggers: {
                location: { 
                    types: ["city", "village"],
                    area: { min_x: 80, max_x: 160, min_y: 80, max_y: 160 }
                },
                requires: ["!discovered_chimera_project", "!destroyed_lab"],
                distance_safe_place: { min: 80, max: 150 },
                player_stats: { intelligenza: { min: 8 } },
                temporal: { days_min: 3 },
                probability: {
                    base: 0.15,
                    modifiers: [
                        { condition: { player_stats: { intelligenza: { min: 12 } } }, value: 0.1 },
                        { condition: { has_items: ["scientific_equipment"] }, value: 0.15 }
                    ]
                }
            },
            
            branches: {
                "investigate_computers": {
                    text: "Investigare i Computer",
                    requirements: { intelligenza: 12 },
                    narrative: "I terminali ronzano debolmente. Codici di accesso che potrebbero rivelare segreti sepolti...",
                    outcomes: {
                        success: {
                            story: "Decripti i file classificati: 'Progetto Chimera - Fase 3 Autorizzata'. Le immagini mostrano orrori bioingegneristici...",
                            effects: {
                                set_flag: "discovered_chimera_project",
                                add_lore_fragment: "chimera_phase_3_files",
                                unlock_events: ["military_bunker_access", "scientist_contact"],
                                world_state: { lab_status: "data_extracted" },
                                relationship_change: { "dr_helena": +3 },
                                reputation: { scientists: +2, military: -1 }
                            }
                        },
                        failure: {
                            story: "Sistema di sicurezza attivato! Allarmi strillano mentre gas tossico si riversa nell'aria...",
                            effects: {
                                damage: 15,
                                spawn_event: "security_chase",
                                set_flag: "lab_security_triggered",
                                add_negative_trait: "sistema_nervoso_danneggiato"
                            }
                        }
                    }
                },
                
                "search_samples": {
                    text: "Cercare Campioni Biologici",
                    requirements: { presagio: 10 },
                    narrative: "I contenitori criogenici sono intatti, ma il loro contenuto potrebbe essere pericoloso...",
                    outcomes: {
                        success: {
                            story: "Trovi campioni biologici stabilizzati e documenti di ricerca. La verità su Chimera inizia a delinearsi...",
                            effects: {
                                add_item: "bio_sample_alpha",
                                add_item: "research_notes_chimera",
                                add_knowledge: "bio_enhancement_theory",
                                set_flag: "has_dangerous_samples",
                                unlock_events: ["underground_trader"],
                                schedule_consequence: {
                                    trigger: { location: { types: ["military"] } },
                                    event_id: "military_interest",
                                    delay: 86400000
                                }
                            }
                        },
                        failure: {
                            story: "Un contenitore si frantuma. Il liquido si riversa bruciando tutto ciò che tocca...",
                            effects: {
                                damage: 20,
                                add_condition: "contamination_mild",
                                set_flag: "lab_contaminated"
                            }
                        }
                    }
                },
                
                "leave_immediately": {
                    text: "Allontanarsi Subito",
                    requirements: {},
                    narrative: "Qualcosa non va in questo posto. Meglio non rischiare...",
                    outcomes: {
                        success: {
                            story: "Ti allontani prudentemente. A volte la saggezza sta nel non agire...",
                            effects: {
                                add_experience: 5,
                                reputation: { survivors: +1 }
                            }
                        }
                    }
                }
            }
        },
        
        "toxic_storm_shelter": {
            id: "toxic_storm_shelter",
            title: "Rifugio dalla Tempesta Tossica",
            description: "Il cielo si sta tingendo di verde malsano. Hai bisogno di un riparo, e in fretta...",
            category: "environmental",
            tier: 1,
            priority: 9,
            
            triggers: {
                temporal: { time_of_day: "storm_approaching" },
                location: { types: ["wasteland", "city", "village"] },
                not_flags: ["in_safe_shelter"],
                probability: 0.25
            },
            
            branches: {
                "abandoned_building": {
                    text: "Rifugiarsi nell'Edificio Abbandonato",
                    requirements: { agilita: 8 },
                    narrative: "L'edificio sembra solido, ma potresti non essere l'unico ad aver avuto questa idea...",
                    outcomes: {
                        success: {
                            story: "Trovi un rifugio sicuro al secondo piano. La tempesta passa senza danneggiarti.",
                            effects: {
                                set_flag: "survived_toxic_storm",
                                add_experience: 8,
                                find_random_loot: { tier: "common", chance: 0.4 }
                            }
                        },
                        failure: {
                            story: "Il pavimento cede sotto i tuoi piedi! Cadi tra i detriti mentre la tempesta infuria...",
                            effects: {
                                damage: 25,
                                add_condition: "leg_injury",
                                exposure_to_toxins: 10
                            }
                        }
                    }
                },
                
                "underground_metro": {
                    text: "Cercare la Metro Sotterranea",
                    requirements: { tracce: 6 },
                    narrative: "I tunnel della metro potrebbero essere sicuri, se riesci a trovarli in tempo...",
                    outcomes: {
                        success: {
                            story: "Trovi un ingresso e scendi nei tunnel. Qui sotto l'aria è stagnante ma pulita.",
                            effects: {
                                set_flag: "discovered_metro_network",
                                unlock_events: ["underground_community"],
                                add_map_markers: ["metro_entrance_1", "metro_entrance_2"]
                            }
                        }
                    }
                },
                
                "endure_storm": {
                    text: "Resistere alla Tempesta",
                    requirements: { potenza: 12 },
                    narrative: "Copri naso e bocca, chiudi gli occhi e resisti. Sei sopravvissuto a di peggio...",
                    outcomes: {
                        success: {
                            story: "La tempesta è brutale, ma la tua resistenza è superiore. Emergi più forte.",
                            effects: {
                                damage: 10,
                                add_trait: "storm_survivor",
                                add_experience: 12,
                                reputation: { survivors: +3 }
                            }
                        },
                        failure: {
                            story: "Le tossine penetrano nei tuoi polmoni. Ogni respiro è agonia...",
                            effects: {
                                damage: 35,
                                add_condition: "respiratory_damage",
                                lose_random_stat: 1
                            }
                        }
                    }
                }
            }
        },
        
        "mysterious_signals": {
            id: "mysterious_signals",
            title: "Segnali Misteriosi",
            description: "La tua radio gracchia con segnali che non dovrebbero esistere. Coordinate, numeri, una voce che sussurra...",
            category: "environmental",
            tier: 2,
            priority: 6,
            
            triggers: {
                has_items: ["portable_radio", "communication_device"],
                distance_safe_place: { min: 50, max: 120 },
                temporal: { time_of_day: "night" },
                not_flags: ["radio_signals_decoded"],
                probability: 0.2
            },
            
            branches: {
                "decode_coordinates": {
                    text: "Decifrare le Coordinate",
                    requirements: { intelligenza: 10, presagio: 8 },
                    narrative: "I numeri formano un pattern. Potrebbero essere coordinate per un luogo specifico...",
                    outcomes: {
                        success: {
                            story: "Le coordinate indicano una posizione a nordest. La voce continua a ripetere: 'Il Progetto continua...'",
                            effects: {
                                set_flag: "radio_signals_decoded",
                                add_map_markers: ["secret_facility_coordinates"],
                                unlock_events: ["secret_facility_approach"],
                                add_knowledge: "radio_encryption_basics"
                            }
                        }
                    }
                },
                
                "follow_voice": {
                    text: "Seguire la Voce",
                    requirements: { presagio: 12 },
                    narrative: "C'è qualcosa di familiare in quella voce. Potrebbe essere... lui?",
                    outcomes: {
                        success: {
                            story: "La voce ti guida verso memorie sepolte. 'Ultimo... se senti questo, sono ancora vivo. Trova il bunker segreto...'",
                            effects: {
                                set_flag: "father_voice_heard",
                                unlock_events: ["father_trail_quest"],
                                relationship_change: { "father_memory": +5 },
                                add_emotional_state: "hope"
                            }
                        }
                    }
                },
                
                "ignore_signals": {
                    text: "Ignorare i Segnali",
                    requirements: {},
                    narrative: "Questi segnali potrebbero essere una trappola. Meglio non rischiare...",
                    outcomes: {
                        success: {
                            story: "Spegni la radio. Il silenzio è più sicuro delle false speranze.",
                            effects: {
                                set_flag: "radio_signals_ignored",
                                reputation: { survivors: +1 }
                            }
                        }
                    }
                }
            }
        },
        
        "contaminated_water_source": {
            id: "contaminated_water_source",
            title: "Fonte d'Acqua Contaminata",
            description: "L'acqua del pozzo ha una strana colorazione verdastra, ma la tua scorta si sta esaurendo...",
            category: "environmental",
            tier: 1,
            priority: 8,
            
            triggers: {
                player_stats: { water: { max: 30 } },
                location: { types: ["wasteland", "village"] },
                not_flags: ["has_water_purifier"],
                probability: 0.3
            },
            
            branches: {
                "drink_carefully": {
                    text: "Bere con Cautela",
                    requirements: { potenza: 8 },
                    narrative: "Forse il tuo sistema immunitario può gestire la contaminazione...",
                    outcomes: {
                        success: {
                            story: "L'acqua ha un sapore metallico, ma il tuo corpo resiste alla contaminazione.",
                            effects: {
                                restore_water: 40,
                                add_experience: 3,
                                add_trait: "toxin_resistance_minor"
                            }
                        },
                        failure: {
                            story: "L'acqua brucia mentre scende. Il tuo stomaco si contorce in spasmi dolorosi...",
                            effects: {
                                restore_water: 20,
                                damage: 15,
                                add_condition: "stomach_poisoning"
                            }
                        }
                    }
                },
                
                "purify_water": {
                    text: "Purificare l'Acqua",
                    requirements: { has_item: "purification_tablets" },
                    narrative: "Le compresse di purificazione dovrebbero neutralizzare la maggior parte dei contaminanti...",
                    outcomes: {
                        success: {
                            story: "Le compresse fanno il loro lavoro. L'acqua diventa potabile e sicura.",
                            effects: {
                                restore_water: 60,
                                consume_item: "purification_tablets",
                                add_knowledge: "water_purification"
                            }
                        }
                    }
                },
                
                "search_alternative": {
                    text: "Cercare Fonte Alternativa",
                    requirements: { tracce: 8 },
                    narrative: "Ci dev'essere un'altra fonte d'acqua nelle vicinanze...",
                    outcomes: {
                        success: {
                            story: "Trovi una sorgente naturale nascosta dietro le rocce. L'acqua è cristallina e pura.",
                            effects: {
                                restore_water: 80,
                                add_map_markers: ["clean_water_source"],
                                add_experience: 5
                            }
                        },
                        failure: {
                            story: "Dopo ore di ricerca, non trovi nulla. La sete inizia a diventare preoccupante.",
                            effects: {
                                lose_water: 10,
                                add_fatigue: 5
                            }
                        }
                    }
                }
            }
        },
        
        "ancient_bunker_entrance": {
            id: "ancient_bunker_entrance",
            title: "Ingresso del Bunker Antico",
            description: "Una porta d'acciaio spessa emerge dal terreno. I simboli pre-guerra sono ancora visibili...",
            category: "environmental",
            tier: 3,
            priority: 5,
            unique: true,
            
            triggers: {
                distance_safe_place: { min: 120, max: 180 },
                player_stats: { tracce: { min: 10 } },
                temporal: { days_min: 7 },
                requires: ["!bunker_explored"],
                probability: 0.1
            },
            
            branches: {
                "force_entry": {
                    text: "Forzare l'Ingresso",
                    requirements: { potenza: 14, has_item: "crowbar" },
                    narrative: "I cardini sono arrugginiti, ma con la leva giusta potresti riuscire ad aprire...",
                    outcomes: {
                        success: {
                            story: "La porta cede con un gemito metallico. L'aria stantia del bunker ti colpisce come un pugno.",
                            effects: {
                                set_flag: "bunker_explored",
                                unlock_events: ["bunker_exploration_quest"],
                                add_location: "pre_war_bunker",
                                consume_item: "crowbar"
                            }
                        }
                    }
                },
                
                "find_access_code": {
                    text: "Cercare il Codice d'Accesso",
                    requirements: { intelligenza: 12, tracce: 8 },
                    narrative: "Dev'esserci una sequenza o un pannello di controllo nascosto da qualche parte...",
                    outcomes: {
                        success: {
                            story: "Trovi una targa nascosta con numeri sbiaditi. Il meccanismo si attiva con un click soddisfacente.",
                            effects: {
                                set_flag: "bunker_accessed_properly",
                                unlock_events: ["bunker_automated_systems"],
                                add_knowledge: "pre_war_technology"
                            }
                        }
                    }
                },
                
                "mark_and_return": {
                    text: "Segnare e Tornare Più Tardi",
                    requirements: {},
                    narrative: "Questo posto richiede preparazione. Meglio tornare quando si è più attrezzati...",
                    outcomes: {
                        success: {
                            story: "Nascondchi tra gli oggetti di riferimento e memorizzi la posizione esatta.",
                            effects: {
                                add_map_markers: ["ancient_bunker_marked"],
                                set_flag: "bunker_location_known",
                                add_experience: 2
                            }
                        }
                    }
                }
            }
        }
    },
    
    // === CATEGORY: CHARACTER INTERACTION EVENTS ===
    character: {
        
        "mysterious_trader": {
            id: "mysterious_trader",
            title: "Il Mercante Misterioso",
            description: "Un uomo con il volto nascosto ti osserva dall'ombra. I suoi occhi brillano di conoscenza proibita...",
            category: "character",
            tier: 2,
            priority: 6,
            
            triggers: {
                reputation: { traders: { min: 3 } },
                has_items: ["rare_artifact", "pre_war_tech", "bio_sample_alpha"],
                not_flags: ["trader_betrayed", "trader_dead"],
                distance_safe_place: { min: 60, max: 140 },
                probability: 0.18
            },
            
            character_data: {
                name: "Viktor 'Il Collezionista'",
                personality: ["cunning", "knowledge_hungry", "morally_ambiguous"],
                history: "Ex-scienziato del Progetto Chimera, ora mercante di informazioni",
                initial_relationship: 0,
                trust_threshold: 8
            },
            
            branches: {
                "trade_artifacts": {
                    text: "Proporre uno Scambio",
                    requirements: { has_item: "rare_artifact" },
                    narrative: "Viktor esamina il tuo artefatto con interesse. 'Interessante... molto interessante...'",
                    dynamic_outcomes: true,
                    relationship_modifiers: {
                        character: "viktor",
                        trust_threshold: 8,
                        outcomes: {
                            high_trust: {
                                story: "Viktor sorride e tira fuori una mappa dettagliata. 'Sei degno di fiducia. Queste sono posizioni che nessuno conosce...'",
                                effects: {
                                    consume_item: "rare_artifact",
                                    add_item: "viktor_secret_map",
                                    reveal_map: { type: "secret_locations", radius: 8 },
                                    unlock_trader_tier: "legendary",
                                    relationship_change: { "viktor": +3 },
                                    reputation: { traders: +2 }
                                }
                            },
                            low_trust: {
                                story: "Viktor è cauto. 'Un buon pezzo, ma non ci conosciamo abbastanza...' Lo scambio è standard.",
                                effects: {
                                    consume_item: "rare_artifact",
                                    add_item: "standard_supplies",
                                    trade_multiplier: 0.8,
                                    relationship_change: { "viktor": +1 }
                                }
                            }
                        }
                    }
                },
                
                "ask_about_chimera": {
                    text: "Chiedere del Progetto Chimera",
                    requirements: { has_flag: "discovered_chimera_project" },
                    narrative: "I suoi occhi si stringono quando menzioni Chimera. Le sue mani tremano impercettibilmente...",
                    outcomes: {
                        success: {
                            story: "Viktor esita, poi confessa: 'Ero uno di loro. Il progetto... ha distrutto tutto ciò che amavo. Ma forse posso ancora rimediare...'",
                            effects: {
                                unlock_events: ["chimera_informant_questline"],
                                set_relationship: { viktor: 15 },
                                add_lore_fragment: "chimera_insider_truth",
                                reputation: { scientists: +1, military: -2 }
                            }
                        }
                    }
                },
                
                "threaten_trader": {
                    text: "Minacciare il Mercante",
                    requirements: { potenza: 12, influenza: 8 },
                    narrative: "Viktor indietreggia, ma i suoi occhi diventano freddi come l'acciaio...",
                    outcomes: {
                        success: {
                            story: "Viktor cede alle tue minacce, ma sussurra: 'Questo non resterà senza conseguenze...'",
                            effects: {
                                gain_free_item: "viktor_supplies",
                                relationship_change: { "viktor": -10 },
                                set_flag: "trader_threatened",
                                reputation: { traders: -3 },
                                schedule_consequence: {
                                    trigger: { location: { types: ["city"] } },
                                    event_id: "trader_revenge",
                                    delay: 172800000
                                }
                            }
                        },
                        failure: {
                            story: "Viktor sorride freddamente e scompare nell'ombra. Hai sottovalutato questo uomo...",
                            effects: {
                                set_flag: "trader_escaped",
                                relationship_change: { "viktor": -15 },
                                reputation: { traders: -5 }
                            }
                        }
                    }
                },
                
                "leave_peacefully": {
                    text: "Andarsene Tranquillamente",
                    requirements: {},
                    narrative: "Non tutti gli incontri devono portare a conflitti...",
                    outcomes: {
                        success: {
                            story: "Viktor annuisce con rispetto. 'Saggia scelta. I nostri cammini si incroceranno di nuovo...'",
                            effects: {
                                relationship_change: { "viktor": +1 },
                                reputation: { traders: +1 },
                                add_experience: 3
                            }
                        }
                    }
                }
            }
        },
        
        "wounded_survivor": {
            id: "wounded_survivor",
            title: "Sopravvissuto Ferito",
            description: "Una donna giace a terra, il sangue forma una pozza attorno alla sua gamba. I suoi occhi ti implorano aiuto...",
            category: "character",
            tier: 1,
            priority: 8,
            
            triggers: {
                location: { types: ["wasteland", "village", "city"] },
                not_flags: ["survivor_helped", "survivor_abandoned"],
                player_stats: { hp: { min: 50 } },
                probability: 0.22
            },
            
            character_data: {
                name: "Elena",
                personality: ["desperate", "grateful", "knowledgeable"],
                history: "Medico prima della guerra, ora vaga cercando di aiutare i sopravvissuti",
                initial_relationship: 0
            },
            
            branches: {
                "provide_medical_aid": {
                    text: "Prestare Soccorso Medico",
                    requirements: { has_item: "medical_kit" },
                    narrative: "Elena geme mentre disinfetti la ferita. 'Grazie... pensavo di essere finita...'",
                    outcomes: {
                        success: {
                            story: "La ferita si cicatrizza rapidamente. Elena si alza, grata. 'Conosco questo territorio, lascia che ricambi il favore...'",
                            effects: {
                                consume_item: "medical_kit",
                                set_flag: "survivor_helped",
                                relationship_change: { "elena": +8 },
                                unlock_events: ["elena_medical_knowledge"],
                                add_map_markers: ["safe_medical_cache"],
                                reputation: { survivors: +3 }
                            }
                        }
                    }
                },
                
                "share_water": {
                    text: "Condividere la tua Acqua",
                    requirements: { water: { min: 40 } },
                    narrative: "L'acqua è preziosa, ma la vita umana lo è di più...",
                    outcomes: {
                        success: {
                            story: "Elena beve avidamente. 'Non dimenticherò mai questa gentilezza...'",
                            effects: {
                                lose_water: 20,
                                set_flag: "shared_water_elena",
                                relationship_change: { "elena": +5 },
                                add_trait: "compassionate",
                                reputation: { survivors: +2 }
                            }
                        }
                    }
                },
                
                "interrogate_first": {
                    text: "Interrogarla Prima di Aiutare",
                    requirements: { influenza: 6 },
                    narrative: "Elena potrebbe avere informazioni preziose...",
                    outcomes: {
                        success: {
                            story: "Elena, disperata, rivela: 'Ho visto soldati... con simboli strani. Si dirigevano verso le montagne...'",
                            effects: {
                                add_knowledge: "military_movement_intel",
                                unlock_events: ["military_patrol_encounter"],
                                relationship_change: { "elena": -2 }
                            }
                        }
                    }
                },
                
                "leave_her": {
                    text: "Lasciarla al suo Destino",
                    requirements: {},
                    narrative: "Le risorse sono scarse e la sopravvivenza è tutto...",
                    outcomes: {
                        success: {
                            story: "Ti allontani mentre Elena continua a implorare. La crudeltà è a volte necessaria...",
                            effects: {
                                set_flag: "survivor_abandoned",
                                add_trait: "ruthless",
                                reputation: { survivors: -5 },
                                add_negative_emotional_state: "guilt"
                            }
                        }
                    }
                }
            }
        },
        
        "mysterious_child": {
            id: "mysterious_child",
            title: "Il Bambino Misterioso",
            description: "Un bambino ti osserva da dietro i detriti. I suoi occhi sono troppo vecchi per la sua età...",
            category: "character",
            tier: 2,
            priority: 7,
            unique: true,
            
            triggers: {
                location: { types: ["city", "village"] },
                not_flags: ["child_encountered"],
                temporal: { time_of_day: "day" },
                requires: ["!hostile_reputation"],
                probability: 0.15
            },
            
            character_data: {
                name: "Alex",
                personality: ["wise_beyond_years", "cautious", "psychic_sensitive"],
                history: "Sopravvissuto alle radiazioni, sviluppato abilità psichiche",
                initial_relationship: 5
            },
            
            branches: {
                "approach_gently": {
                    text: "Avvicinarsi Delicatamente",
                    requirements: { presagio: 8 },
                    narrative: "Il bambino non scappa. I suoi occhi sembrano vedere oltre il visibile...",
                    outcomes: {
                        success: {
                            story: "Alex sussurra: 'Vedo il tuo futuro... due strade. Una porta alla salvezza, l'altra alla perdizione...'",
                            effects: {
                                set_flag: "child_encountered",
                                unlock_events: ["prophecy_questline"],
                                add_psychic_insight: "future_vision_1",
                                relationship_change: { "alex": +5 }
                            }
                        }
                    }
                },
                
                "offer_food": {
                    text: "Offrire del Cibo",
                    requirements: { has_item: "canned_food" },
                    narrative: "Il bambino deve essere affamato...",
                    outcomes: {
                        success: {
                            story: "Alex prende il cibo con gratitudine. 'Le persone gentili sono rare... tu sei speciale.'",
                            effects: {
                                consume_item: "canned_food",
                                set_flag: "fed_mysterious_child",
                                relationship_change: { "alex": +8 },
                                add_blessing: "child_protection",
                                reputation: { survivors: +2 }
                            }
                        }
                    }
                },
                
                "ask_about_visions": {
                    text: "Chiedere delle sue Visioni",
                    requirements: { intelligenza: 10 },
                    narrative: "C'è qualcosa di soprannaturale in questo bambino...",
                    outcomes: {
                        success: {
                            story: "Alex chiude gli occhi: 'Vedo... una città di metallo e vetro. Lì troverai ciò che cerchi, ma anche grande pericolo...'",
                            effects: {
                                add_prophecy: "metal_glass_city",
                                unlock_events: ["prophetic_guidance"],
                                add_map_markers: ["prophetic_location"],
                                relationship_change: { "alex": +3 }
                            }
                        }
                    }
                }
            }
        }
    },
    
    // === CATEGORY: QUEST CHAIN EVENTS ===
    questlines: {
        
        "chimera_conspiracy": {
            id: "chimera_conspiracy",
            title: "La Cospirazione Chimera",
            description: "I frammenti di verità si stanno unendo. Il Progetto Chimera è più grande e terrificante di quanto immaginassi...",
            category: "questlines",
            tier: 3,
            priority: 9,
            chain_length: 5,
            current_step: 1,
            
            triggers: {
                requires: ["discovered_chimera_project", "chimera_insider_truth"],
                not_flags: ["chimera_quest_completed"],
                distance_safe_place: { min: 40 }
            },
            
            steps: [
                {
                    step: 1,
                    title: "Tracce del Passato",
                    description: "Le informazioni di Viktor indicano tre facility di ricerca. Devi trovarle tutte.",
                    triggers: { has_flag: "discovered_chimera_project" },
                    objectives: [
                        "find_research_facility_alpha",
                        "find_research_facility_beta", 
                        "find_research_facility_gamma"
                    ],
                    branches: {
                        "continue_investigation": {
                            text: "Continuare l'Investigazione",
                            narrative: "Ogni facility potrebbe contenere un pezzo del puzzle...",
                            outcomes: {
                                success: {
                                    story: "Le coordinate delle facility sono ora chiare nella tua mente.",
                                    effects: {
                                        add_map_markers: ["facility_alpha", "facility_beta", "facility_gamma"],
                                        set_quest_progress: { chimera_conspiracy: 2 }
                                    }
                                }
                            }
                        }
                    }
                },
                
                {
                    step: 2,
                    title: "La Verità Emerge",
                    description: "Hai raccolto dati da tutte e tre le facility. I file rivelano coordinate per una location segreta.",
                    triggers: { 
                        completed_objectives: ["find_research_facility_alpha", "find_research_facility_beta", "find_research_facility_gamma"],
                        has_items: ["data_fragment_alpha", "data_fragment_beta", "data_fragment_gamma"]
                    },
                    narrative: "I frammenti dati si combinano rivelando coordinate nascoste...",
                    branches: {
                        "decode_final_location": {
                            text: "Decifrare la Posizione Finale",
                            requirements: { intelligenza: 14 },
                            narrative: "La combinazione dei dati rivela un pattern nascosto...",
                            outcomes: {
                                success: {
                                    story: "Le coordinate puntano a un bunker sotterraneo ultra-segreto. Il cuore di Chimera...",
                                    effects: {
                                        unlock_events: ["chimera_central_bunker"],
                                        add_map_markers: ["chimera_hq_coordinates"],
                                        set_quest_progress: { chimera_conspiracy: 3 }
                                    }
                                }
                            }
                        }
                    }
                }
                // Steps 3-5 would continue the chain...
            ]
        },
        
        "father_trail_quest": {
            id: "father_trail_quest",
            title: "Sulle Tracce del Padre",
            description: "La voce alla radio era reale. Tuo padre è vivo, e ha lasciato indizi per guidarti verso di lui...",
            category: "questlines",
            tier: 3,
            priority: 10,
            chain_length: 4,
            current_step: 1,
            emotional_weight: "high",
            
            triggers: {
                requires: ["father_voice_heard"],
                not_flags: ["father_quest_completed"]
            },
            
            steps: [
                {
                    step: 1,
                    title: "Il Primo Indizio",
                    description: "La voce menzionava un 'bunker segreto'. Devi decifrare il messaggio.",
                    triggers: { has_flag: "father_voice_heard" },
                    objectives: ["decode_father_message", "find_bunker_coordinates"],
                    branches: {
                        "analyze_radio_message": {
                            text: "Analizzare il Messaggio Radio",
                            requirements: { intelligenza: 12, presagio: 10 },
                            narrative: "Riascolti la registrazione cercando indizi nascosti...",
                            outcomes: {
                                success: {
                                    story: "Tra i disturbi, riconosci un pattern: coordinate in codice morse antico...",
                                    effects: {
                                        add_knowledge: "morse_code_pattern",
                                        set_flag: "decoded_father_morse",
                                        set_quest_progress: { father_trail_quest: 2 },
                                        add_emotional_state: "determination"
                                    }
                                }
                            }
                        }
                    }
                },
                
                {
                    step: 2,
                    title: "Il Bunker Nascosto",
                    description: "Le coordinate ti portano a un bunker nascosto tra le montagne.",
                    triggers: { has_flag: "decoded_father_morse" },
                    narrative: "Il bunker è sigillato, ma riconosci il sistema di sicurezza...",
                    branches: {
                        "use_family_code": {
                            text: "Usare il Codice di Famiglia",
                            requirements: { has_knowledge: "family_emergency_protocol" },
                            narrative: "Il codice che tuo padre ti insegnò da bambino...",
                            outcomes: {
                                success: {
                                    story: "La porta si apre con un sospiro. All'interno, tracce del passaggio di tuo padre...",
                                    effects: {
                                        unlock_location: "father_hidden_bunker",
                                        add_item: "father_personal_notes",
                                        set_quest_progress: { father_trail_quest: 3 },
                                        relationship_change: { "father_memory": +8 }
                                    }
                                }
                            }
                        }
                    }
                }
                // Steps 3-4 would complete the emotional journey...
            ]
        }
    }
};

// Event Database Management Functions
const EventDatabaseManager = {
    
    getEvent(eventId) {
        for (const category of Object.values(EVENT_DATABASE_V2)) {
            if (category[eventId]) {
                return category[eventId];
            }
        }
        return null;
    },
    
    getEventsByCategory(categoryName) {
        return EVENT_DATABASE_V2[categoryName] || {};
    },
    
    getEventsByTier(tier) {
        const events = [];
        for (const category of Object.values(EVENT_DATABASE_V2)) {
            for (const event of Object.values(category)) {
                if (event.tier === tier) {
                    events.push(event);
                }
            }
        }
        return events;
    },
    
    getAllEvents() {
        const allEvents = [];
        for (const category of Object.values(EVENT_DATABASE_V2)) {
            allEvents.push(...Object.values(category));
        }
        return allEvents;
    },
    
    validateEventData(eventData) {
        const required = ['id', 'title', 'category', 'triggers', 'branches'];
        return required.every(field => eventData.hasOwnProperty(field));
    },
    
    getStats() {
        let totalEvents = 0;
        const categoryStats = {};
        
        for (const [categoryName, category] of Object.entries(EVENT_DATABASE_V2)) {
            const count = Object.keys(category).length;
            categoryStats[categoryName] = count;
            totalEvents += count;
        }
        
        return {
            totalEvents,
            categoryStats,
            averageBranchesPerEvent: this.getAverageBranches()
        };
    },
    
    getAverageBranches() {
        const allEvents = this.getAllEvents();
        const totalBranches = allEvents.reduce((sum, event) => 
            sum + Object.keys(event.branches || {}).length, 0
        );
        return (totalBranches / allEvents.length).toFixed(2);
    }
};

// Export for global access
if (typeof window !== 'undefined') {
    window.EVENT_DATABASE_V2 = EVENT_DATABASE_V2;
    window.EventDatabaseManager = EventDatabaseManager;
    
    console.log("[EventDatabase] Database V2.0 loaded:", EventDatabaseManager.getStats());
}
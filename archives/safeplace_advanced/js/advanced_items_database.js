/**
 * THE SAFE PLACE - ADVANCED ITEMS DATABASE v2.0
 * Database Oggetti Avanzato - 30 nuovi oggetti per raggiungere 119 totali
 * 
 * Recupero Architettura Avanzata - Fase 4.3
 * Data: 29 Dicembre 2024
 */

// Sistema di Rarità Avanzato
const RARITY_SYSTEM = {
    COMMON: {
        name: 'Comune',
        color: '#9ca3af', // Grigio
        valueMultiplier: 1.0,
        dropChance: 0.6
    },
    UNCOMMON: {
        name: 'Non Comune',
        color: '#22c55e', // Verde
        valueMultiplier: 1.5,
        dropChance: 0.25
    },
    RARE: {
        name: 'Raro',
        color: '#3b82f6', // Blu
        valueMultiplier: 2.5,
        dropChance: 0.1
    },
    EPIC: {
        name: 'Epico',
        color: '#8b5cf6', // Viola
        valueMultiplier: 4.0,
        dropChance: 0.04
    },
    LEGENDARY: {
        name: 'Leggendario',
        color: '#f59e0b', // Oro
        valueMultiplier: 6.0,
        dropChance: 0.01
    }
};

// Database Oggetti Avanzati (30 nuovi oggetti)
const ADVANCED_ITEMS = {
    
    // === 1. OGGETTI UNICI/LEGGENDARI (8 oggetti) ===
    
    'last_letter_from_dad': {
        id: 'last_letter_from_dad',
        name: 'Ultima Lettera di Papà',
        nameShort: 'Lettera Papà',
        description: "Un foglio ingiallito con la calligrafia familiare. Le ultime parole del padre sono una guida e un conforto nei momenti più bui. 'Trova il Safe Place, Ultimo. Tutto quello che abbiamo sognato ti attende lì.'",
        type: 'unique',
        rarity: 'LEGENDARY',
        weight: 0.1,
        value: 1000,
        stackable: false,
        usable: true,
        effects: [
            { type: 'morale_boost', amount: 20, duration: 24 },
            { type: 'reveal_lore', loreKey: 'fathers_final_message' },
            { type: 'permanent_hope', bonus: 5 }
        ]
    },
    
    'ultimate_survivor_journal': {
        id: 'ultimate_survivor_journal',
        name: 'Diario di Ultimo',
        nameShort: 'Diario Ultimo',
        description: "Il tuo diario personale, riempito con osservazioni sulla sopravvivenza, mappe improvvisate e ricordi del passato. Ogni pagina è una lezione appresa.",
        type: 'unique',
        rarity: 'EPIC',
        weight: 0.3,
        value: 500,
        stackable: false,
        usable: true,
        effects: [
            { type: 'experience_bonus', amount: 0.15 },
            { type: 'survival_knowledge', skillBonus: 10 },
            { type: 'learn_from_mistakes', failureReduction: 0.2 }
        ]
    },
    
    'fathers_compass': {
        id: 'fathers_compass',
        name: 'Bussola del Padre',
        nameShort: 'Bussola Papà',
        description: "Una bussola militare incisa con le iniziali del padre. L'ago punta sempre verso nord, ma senti che ti guida verso qualcosa di più importante: la speranza.",
        type: 'tool',
        rarity: 'LEGENDARY',
        slot: 'accessory',
        weight: 0.2,
        value: 800,
        stackable: false,
        durability: 100,
        maxDurability: 100,
        effects: [
            { type: 'navigation_mastery', accuracy: 1.0 },
            { type: 'never_lost', wanderingPrevention: true },
            { type: 'path_of_hope', safePlaceGuidance: true }
        ]
    },
    
    'prewar_family_photo': {
        id: 'prewar_family_photo',
        name: 'Foto di Famiglia Pre-Guerra',
        nameShort: 'Foto Famiglia',
        description: "Una foto sbiadita che mostra te, il padre e una donna sorridente in un mondo che non esiste più. La madre che non ricordi, ma che vive nel tuo cuore.",
        type: 'unique',
        rarity: 'RARE',
        weight: 0.05,
        value: 300,
        stackable: false,
        usable: true,
        effects: [
            { type: 'emotional_strength', resistanceBonus: 15 },
            { type: 'mothers_love', healingBonus: 0.25 },
            { type: 'family_memory', determination: 10 }
        ]
    },
    
    'mothers_locket': {
        id: 'mothers_locket',
        name: 'Medaglione della Madre',
        nameShort: 'Medaglione',
        description: "Un piccolo medaglione d'argento con l'immagine di una donna gentile. Dentro, incisa finemente: 'Per Ultimo, con tutto il mio amore - Mamma'.",
        type: 'accessory',
        rarity: 'EPIC',
        slot: 'accessory',
        weight: 0.1,
        value: 600,
        stackable: false,
        durability: 999,
        maxDurability: 999,
        effects: [
            { type: 'mothers_protection', damageReduction: 0.1 },
            { type: 'inner_peace', stressReduction: 0.3 },
            { type: 'loving_memory', hpRegenerationBonus: 2 }
        ]
    },
    
    'nuclear_detector_advanced': {
        id: 'nuclear_detector_advanced',
        name: 'Rilevatore Nucleare Avanzato',
        nameShort: 'Rilevatore Nucleare',
        description: "Un dispositivo pre-guerra ancora funzionante che rileva radiazioni e anomalie nucleari. I suoi sensori avanzati possono salvare la vita.",
        type: 'tool',
        rarity: 'LEGENDARY',
        slot: 'accessory',
        weight: 1.0,
        value: 1200,
        stackable: false,
        durability: 50,
        maxDurability: 50,
        effects: [
            { type: 'radiation_immunity', protection: 0.8 },
            { type: 'nuclear_hazard_detection', earlyWarning: true },
            { type: 'safe_zone_identification', dangerZoneAvoidance: 0.7 }
        ]
    },
    
    'safe_place_map_fragment_master': {
        id: 'safe_place_map_fragment_master',
        name: 'Frammento Mappa Principale',
        nameShort: 'Mappa Master',
        description: "Il frammento di mappa più importante: mostra la posizione esatta del Safe Place e i percorsi sicuri per raggiungerlo. Una chiave per il futuro.",
        type: 'unique',
        rarity: 'EPIC',
        weight: 0.1,
        value: 800,
        stackable: false,
        usable: true,
        effects: [
            { type: 'reveal_safe_place', fullPath: true },
            { type: 'optimal_routing', travelTimeReduction: 0.3 },
            { type: 'destiny_guidance', finalQuestBonus: 25 }
        ]
    },
    
    'prewar_military_tags': {
        id: 'prewar_military_tags',
        name: 'Piastrine Militari Pre-Guerra',
        nameShort: 'Piastrine',
        description: "Piastrine di identificazione militare appartenenti a un soldato sconosciuto. Incise: 'Sgt. Marcus Chen - Never Leave a Man Behind'.",
        type: 'unique',
        rarity: 'RARE',
        weight: 0.08,
        value: 250,
        stackable: false,
        effects: [
            { type: 'military_discipline', combatBonus: 8 },
            { type: 'never_give_up', lastStandBonus: 0.5 },
            { type: 'warrior_spirit', courageBonus: 12 }
        ]
    },
    
    // === 2. SET ITEMS - "WASTELANDER SET" (3 oggetti) ===
    
    'wastelander_coat': {
        id: 'wastelander_coat',
        name: 'Cappotto del Vagabondo',
        nameShort: 'Cappotto Vagab.',
        description: "Un lungo cappotto di cuoio rinforzato con placche metalliche. Indossato da innumerevoli viandanti delle terre desolate. Parte del leggendario Wastelander Set.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'body',
        armorValue: 6,
        weight: 2.5,
        value: 400,
        stackable: false,
        durability: 80,
        maxDurability: 80,
        setId: 'wastelander_set',
        effects: [
            { type: 'elemental_resistance', amount: 0.15 },
            { type: 'weather_protection', allWeather: true }
        ]
    },
    
    'wastelander_boots': {
        id: 'wastelander_boots',
        name: 'Stivali del Vagabondo',
        nameShort: 'Stivali Vagab.',
        description: "Stivali da combattimento rinforzati con suole metalliche e protezioni laterali. Perfetti per attraversare ogni terreno ostile.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'feet',
        armorValue: 3,
        weight: 1.2,
        value: 300,
        stackable: false,
        durability: 70,
        maxDurability: 70,
        setId: 'wastelander_set',
        effects: [
            { type: 'movement_speed', bonus: 0.1 },
            { type: 'terrain_immunity', roughTerrain: true }
        ]
    },
    
    'wastelander_gloves': {
        id: 'wastelander_gloves',
        name: 'Guanti del Vagabondo',
        nameShort: 'Guanti Vagab.',
        description: "Guanti tattici rinforzati con protezioni per le nocche. Permettono una presa salda delle armi anche nelle condizioni più difficili.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'hands',
        armorValue: 2,
        weight: 0.3,
        value: 250,
        stackable: false,
        durability: 60,
        maxDurability: 60,
        setId: 'wastelander_set',
        effects: [
            { type: 'weapon_grip', stabilityBonus: 0.2 },
            { type: 'manual_dexterity', craftingBonus: 0.1 }
        ]
    },
    
    // === 3. SET ITEMS - "SCAVENGER SET" (3 oggetti) ===
    
    'scavenger_backpack': {
        id: 'scavenger_backpack',
        name: 'Zaino da Recupero',
        nameShort: 'Zaino Recupero',
        description: "Uno zaino militare modificato con tasche extra e ganci per attrezzi. Il sogno di ogni saccheggiatore. Parte dello Scavenger Set.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'back',
        weight: 1.0,
        value: 350,
        stackable: false,
        durability: 90,
        maxDurability: 90,
        setId: 'scavenger_set',
        effects: [
            { type: 'inventory_expansion', slots: 5 },
            { type: 'weight_reduction', reduction: 0.2 }
        ]
    },
    
    'scavenger_goggles': {
        id: 'scavenger_goggles',
        name: 'Occhiali da Scavo',
        nameShort: 'Occhiali Scavo',
        description: "Occhiali protettivi con lenti intercambiabili e sensori di movimento. Perfetti per individuare tesori nascosti nelle rovine.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'head',
        armorValue: 1,
        weight: 0.2,
        value: 300,
        stackable: false,
        durability: 50,
        maxDurability: 50,
        setId: 'scavenger_set',
        effects: [
            { type: 'treasure_detection', bonus: 0.3 },
            { type: 'detail_vision', searchBonus: 0.25 }
        ]
    },
    
    'scavenger_tool_belt': {
        id: 'scavenger_tool_belt',
        name: 'Cintura Attrezzi',
        nameShort: 'Cintura Attrezzi',
        description: "Una cintura specializzata con attrezzi da scavo, pinze, cacciaviti e piccoli utensili. L'arsenale completo di ogni recuperatore.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'belt',
        weight: 0.8,
        value: 280,
        stackable: false,
        durability: 75,
        maxDurability: 75,
        setId: 'scavenger_set',
        effects: [
            { type: 'crafting_mastery', successBonus: 0.2 },
            { type: 'salvage_efficiency', materialBonus: 0.3 }
        ]
    },
    
    // === 4. ACCESSORI AVANZATI (5 oggetti) ===
    
    'radiation_badge': {
        id: 'radiation_badge',
        name: 'Dosimetro Personale',
        nameShort: 'Dosimetro',
        description: "Un piccolo dispositivo che monitora costantemente l'esposizione alle radiazioni. Cambia colore in base al livello di pericolo.",
        type: 'tool',
        rarity: 'UNCOMMON',
        slot: 'accessory',
        weight: 0.1,
        value: 45,
        stackable: false,
        effects: [
            { type: 'radiation_monitoring', alertLevel: 0.5 },
            { type: 'exposure_tracking', healthWarning: true }
        ]
    },
    
    'lucky_charm_rabbit_foot': {
        id: 'lucky_charm_rabbit_foot',
        name: 'Zampa di Coniglio Portafortuna',
        nameShort: 'Zampa Fortuna',
        description: "Una zampa di coniglio mutante porta-fortuna. La superstizione dice che porti buona sorte... e nel mondo post-apocalittico, ogni aiuto è benvenuto.",
        type: 'accessory',
        rarity: 'RARE',
        slot: 'accessory',
        weight: 0.05,
        value: 120,
        stackable: false,
        effects: [
            { type: 'luck_bonus', amount: 15 },
            { type: 'critical_chance', bonus: 0.05 },
            { type: 'fortune_favor', randomEventsBonus: 0.1 }
        ]
    },
    
    'tactical_watch_solar': {
        id: 'tactical_watch_solar',
        name: 'Orologio Tattico Solare',
        nameShort: 'Orologio Tattico',
        description: "Un orologio militare avanzato con pannello solare, GPS integrato e funzioni di sopravvivenza. Non si scarica mai finché c'è luce.",
        type: 'tool',
        rarity: 'EPIC',
        slot: 'accessory',
        weight: 0.15,
        value: 400,
        stackable: false,
        durability: 200,
        maxDurability: 200,
        effects: [
            { type: 'time_management', efficiencyBonus: 0.1 },
            { type: 'mission_planning', actionPointBonus: 2 },
            { type: 'solar_powered', neverBreaks: true }
        ]
    },
    
    'emergency_flare_gun': {
        id: 'emergency_flare_gun',
        name: 'Pistola Segnalazione',
        nameShort: 'Pistola Segnale',
        description: "Una pistola segnalazione d'emergenza con alcune razzi colorati. Può essere usata per segnalazioni a lunga distanza o come arma improvvisata.",
        type: 'weapon',
        rarity: 'UNCOMMON',
        slot: 'weapon',
        weaponType: 'segnalazione',
        damage: { min: 3, max: 8 },
        weight: 0.8,
        value: 75,
        stackable: false,
        durability: 15,
        maxDurability: 15,
        ammoType: 'flare_rounds',
        effects: [
            { type: 'distress_signal', range: 'very_long' },
            { type: 'flare_damage', fireChance: 0.3 }
        ]
    },
    
    'portable_geiger_counter': {
        id: 'portable_geiger_counter',
        name: 'Contatore Geiger Portatile',
        nameShort: 'Geiger',
        description: "Un contatore Geiger militare portatile. I suoi clic incessanti sono il suono della sopravvivenza in un mondo radioattivo.",
        type: 'tool',
        rarity: 'RARE',
        slot: 'accessory',
        weight: 0.5,
        value: 200,
        stackable: false,
        durability: 100,
        maxDurability: 100,
        effects: [
            { type: 'radiation_detection', precision: 0.9 },
            { type: 'contamination_mapping', areaAnalysis: true },
            { type: 'safe_path_finding', radiationAvoidance: 0.8 }
        ]
    },
    
    // === 5. ARMI AVANZATE (4 oggetti) ===
    
    'chainsaw_makeshift': {
        id: 'chainsaw_makeshift',
        name: 'Motosega Improvvisata',
        nameShort: 'Motosega',
        description: "Una motosega da boscaiolo modificata con parti di recupero. Rumorosa, affamata di carburante, ma devastantemente efficace.",
        type: 'weapon',
        rarity: 'EPIC',
        slot: 'weapon',
        weaponType: 'mischia_pesante',
        damage: { min: 15, max: 25 },
        weight: 4.0,
        value: 600,
        stackable: false,
        durability: 40,
        maxDurability: 40,
        fuelRequired: true,
        effects: [
            { type: 'dismember_chance', probability: 0.3 },
            { type: 'fear_factor', enemyMoraleDebuff: 0.4 },
            { type: 'area_damage', multipleTargets: 2 }
        ]
    },
    
    'flamethrower_improvised': {
        id: 'flamethrower_improvised',
        name: 'Lanciafiamme Artigianale',
        nameShort: 'Lanciafiamme',
        description: "Un lanciafiamme costruito con un estintore modificato e tubi di recupero. Estremamente pericoloso per nemici... e per chi lo usa.",
        type: 'weapon',
        rarity: 'LEGENDARY',
        slot: 'weapon',
        weaponType: 'fuoco_pesante',
        damage: { min: 20, max: 35 },
        weight: 5.0,
        value: 1000,
        stackable: false,
        durability: 25,
        maxDurability: 25,
        ammoType: 'fuel_canister',
        effects: [
            { type: 'burn_damage_over_time', duration: 3 },
            { type: 'area_fire_effect', radius: 2 },
            { type: 'panic_inducing', terrorEffect: 0.7 }
        ]
    },
    
    'sniper_rifle_damaged': {
        id: 'sniper_rifle_damaged',
        name: 'Fucile da Cecchino Danneggiato',
        nameShort: 'Cecchino Dan.',
        description: "Un fucile di precisione militare con ottica crepata e meccanismo inceppato. Ancora letale nelle mani giuste, ma inaffidabile.",
        type: 'weapon',
        rarity: 'EPIC',
        slot: 'weapon',
        weaponType: 'fucile_precisione',
        damage: { min: 25, max: 40 },
        weight: 3.5,
        value: 800,
        stackable: false,
        durability: 30,
        maxDurability: 30,
        ammoType: 'sniper_rounds',
        effects: [
            { type: 'long_range_precision', accuracyBonus: 0.8 },
            { type: 'headshot_chance', criticalBonus: 0.25 },
            { type: 'unreliable_mechanism', jamChance: 0.15 }
        ]
    },
    
    'plasma_cutter_industrial': {
        id: 'plasma_cutter_industrial',
        name: 'Tagliatrice Plasma Industriale',
        nameShort: 'Tagliatrice Plasma',
        description: "Un strumento industriale per il taglio dei metalli convertito in arma. Il raggio di plasma può tagliare qualsiasi cosa... inclusi i nemici.",
        type: 'weapon',
        rarity: 'LEGENDARY',
        slot: 'weapon',
        weaponType: 'energia',
        damage: { min: 30, max: 45 },
        weight: 3.0,
        value: 1200,
        stackable: false,
        durability: 50,
        maxDurability: 50,
        ammoType: 'plasma_cell',
        effects: [
            { type: 'armor_melting', armorPiercing: 1.0 },
            { type: 'energy_damage', bypassPhysicalResistance: true },
            { type: 'precision_cutting', surgicalAccuracy: 0.9 }
        ]
    },
    
    // === 6. ARMATURE AVANZATE (3 oggetti) ===
    
    'riot_armor_damaged': {
        id: 'riot_armor_damaged',
        name: 'Armatura Antisommossa Danneggiata',
        nameShort: 'Armor. Antisomm.',
        description: "Un'armatura della polizia antisommossa con placche rotte e imbottiture logore. Offre ancora una protezione eccellente.",
        type: 'armor',
        rarity: 'EPIC',
        slot: 'body',
        armorValue: 8,
        weight: 4.0,
        value: 500,
        stackable: false,
        durability: 60,
        maxDurability: 60,
        effects: [
            { type: 'impact_resistance', bluntForceReduction: 0.4 },
            { type: 'crowd_control_immunity', stunResistance: 0.6 },
            { type: 'intimidation_factor', enemyMoraleDebuff: 0.2 }
        ]
    },
    
    'hazmat_suit_patched': {
        id: 'hazmat_suit_patched',
        name: 'Tuta Hazmat Rattoppata',
        nameShort: 'Tuta Hazmat',
        description: "Una tuta di protezione chimica e biologica riparata con nastro adesivo e toppe improvvisate. Non perfetta, ma vitale nelle zone contaminate.",
        type: 'armor',
        rarity: 'RARE',
        slot: 'body',
        armorValue: 4,
        weight: 2.5,
        value: 300,
        stackable: false,
        durability: 45,
        maxDurability: 45,
        effects: [
            { type: 'chemical_immunity', chemicalResistance: 0.8 },
            { type: 'biological_protection', diseaseResistance: 0.7 },
            { type: 'environmental_seal', toxinFiltering: 0.6 }
        ]
    },
    
    'exoskeleton_frame_broken': {
        id: 'exoskeleton_frame_broken',
        name: 'Telaio Esoscheletro Rotto',
        nameShort: 'Esoscheletro',
        description: "I resti di un esoscheletro militare avanzato. Molti sistemi sono fuori uso, ma i servoassistiti delle braccia funzionano ancora parzialmente.",
        type: 'armor',
        rarity: 'LEGENDARY',
        slot: 'body',
        armorValue: 10,
        weight: 8.0,
        value: 1500,
        stackable: false,
        durability: 80,
        maxDurability: 80,
        effects: [
            { type: 'strength_amplification', carryWeightBonus: 0.5 },
            { type: 'servo_assistance', meleeDamageBonus: 0.3 },
            { type: 'partial_systems', functionalityReduced: 0.4 }
        ]
    },
    
    // === 7. CONSUMABILI RARI (4 oggetti) ===
    
    'adrenaline_stim': {
        id: 'adrenaline_stim',
        name: 'Stimolante Adrenalina',
        nameShort: 'Stim Adrenalina',
        description: "Un'iniezione di adrenalina sintetica pre-guerra. Fornisce un boost temporaneo incredibile a tutte le capacità fisiche.",
        type: 'medicine',
        rarity: 'EPIC',
        weight: 0.1,
        value: 400,
        stackable: true,
        usable: true,
        effects: [
            { type: 'temporary_stat_boost', allStats: 8, duration: 10 },
            { type: 'adrenaline_rush', actionPointBonus: 5, duration: 5 },
            { type: 'hypervigilance', criticalChanceBonus: 0.2, duration: 10 }
        ]
    },
    
    'rad_away_concentrate': {
        id: 'rad_away_concentrate',
        name: 'Concentrato Anti-Radiazioni',
        nameShort: 'Rad-Away Conc.',
        description: "Un potente concentrato farmaceutico che neutralizza le radiazioni accumulate nell'organismo. Raro e preziosissimo.",
        type: 'medicine',
        rarity: 'RARE',
        weight: 0.2,
        value: 250,
        stackable: true,
        usable: true,
        effects: [
            { type: 'radiation_cleansing', removalRate: 0.9 },
            { type: 'cellular_repair', healthRestoration: 20 },
            { type: 'immunity_boost', radiationResistance: 0.5, duration: 24 }
        ]
    },
    
    'super_stim_pack': {
        id: 'super_stim_pack',
        name: 'Super Stimpack Medico',
        nameShort: 'Super Stim',
        description: "Un kit medico avanzato con nano-medicine e riparatori cellulari. Può guarire ferite che sembravano mortali in pochi minuti.",
        type: 'medicine',
        rarity: 'EPIC',
        weight: 0.3,
        value: 500,
        stackable: true,
        usable: true,
        effects: [
            { type: 'instant_healing', amount: 40 },
            { type: 'regeneration_boost', hpPerTurn: 5, duration: 8 },
            { type: 'trauma_recovery', statusEffectCure: 'all' }
        ]
    },
    
    'combat_enhancer_pill': {
        id: 'combat_enhancer_pill',
        name: 'Pillola Potenziamento Combattimento',
        nameShort: 'Pills Combat',
        description: "Capsule militari che contengono stimolanti avanzati e nootropi. Migliorano drasticamente le prestazioni in combattimento.",
        type: 'medicine',
        rarity: 'RARE',
        weight: 0.05,
        value: 200,
        stackable: true,
        usable: true,
        effects: [
            { type: 'combat_mastery', attackBonus: 6, defenseBonus: 4, duration: 15 },
            { type: 'focus_enhancement', accuracyBonus: 0.3, duration: 15 },
            { type: 'pain_suppression', damageResistance: 0.2, duration: 15 }
        ]
    }
};

// Sistema Set Bonus
const SET_BONUSES = {
    wastelander_set: {
        name: 'Wastelander Set',
        pieces: ['wastelander_coat', 'wastelander_boots', 'wastelander_gloves'],
        bonuses: {
            2: {
                name: 'Vagabondo Esperto',
                effects: [
                    { type: 'elemental_resistance', bonus: 0.15 },
                    { type: 'movement_speed', bonus: 0.1 }
                ]
            },
            3: {
                name: 'Maestro delle Terre Desolate',
                effects: [
                    { type: 'elemental_resistance', bonus: 0.25 },
                    { type: 'movement_speed', bonus: 0.15 },
                    { type: 'survival_mastery', allSurvivalBonus: 0.2 }
                ]
            }
        }
    },
    
    scavenger_set: {
        name: 'Scavenger Set',
        pieces: ['scavenger_backpack', 'scavenger_goggles', 'scavenger_tool_belt'],
        bonuses: {
            2: {
                name: 'Recuperatore Abile',
                effects: [
                    { type: 'loot_bonus', increase: 0.3 },
                    { type: 'crafting_success', bonus: 0.2 }
                ]
            },
            3: {
                name: 'Maestro del Recupero',
                effects: [
                    { type: 'loot_bonus', increase: 0.5 },
                    { type: 'crafting_success', bonus: 0.3 },
                    { type: 'treasure_sense', rareItemBonus: 0.4 }
                ]
            }
        }
    }
};

// Export per integrazione
if (typeof window !== 'undefined') {
    window.ADVANCED_ITEMS = ADVANCED_ITEMS;
    window.RARITY_SYSTEM = RARITY_SYSTEM;
    window.SET_BONUSES = SET_BONUSES;
}

console.log('[ITEMS] ✅ Advanced Items Database v2.0 caricato - 30 nuovi oggetti aggiunti per 119 totali!'); 
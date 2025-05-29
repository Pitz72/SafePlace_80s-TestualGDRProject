/**
 * THE SAFE PLACE - ACHIEVEMENT SYSTEM
 * v1.0.0 "Ultimo's Journey"
 * 
 * Sistema di trofei e achievement per tracciare i progressi del giocatore
 */

const AchievementSystem = {
    // Definizioni dei trofei
    achievements: {
        // === TROFEI DI SOPRAVVIVENZA E PROGRESSIONE ===
        first_steps: {
            id: 'first_steps',
            name: 'Primi Passi nel Silenzio',
            description: 'Inizia il tuo viaggio verso il Safe Place',
            category: 'progression',
            icon: '🏃',
            automatic: true,
            condition: () => true // Sbloccato automaticamente all'inizio
        },
        
        first_night_survivor: {
            id: 'first_night_survivor',
            name: 'Sopravvissuto alla Prima Notte',
            description: 'Supera la tua prima notte all\'aperto o in un rifugio',
            category: 'survival',
            icon: '🌙',
            condition: (playerState) => playerState.nightsSurvived >= 1
        },
        
        master_of_desolation: {
            id: 'master_of_desolation',
            name: 'Maestro della Desolazione',
            description: 'Sopravvivi per 30 giorni',
            category: 'survival',
            icon: '👑',
            condition: (playerState) => playerState.daysSurvived >= 30
        },
        
        self_sufficient: {
            id: 'self_sufficient',
            name: 'Autosufficiente',
            description: 'Crafta con successo 10 oggetti diversi',
            category: 'crafting',
            icon: '🔨',
            condition: (playerState) => (playerState.craftedItems?.length || 0) >= 10
        },
        
        expert_nomad: {
            id: 'expert_nomad',
            name: 'Nomade Esperto',
            description: 'Esplora 500 caselle della mappa',
            category: 'exploration',
            icon: '🗺️',
            condition: (playerState) => (playerState.tilesExplored || 0) >= 500
        },
        
        labyrinth_veteran: {
            id: 'labyrinth_veteran',
            name: 'Veterano del Labirinto',
            description: 'Raggiungi il livello 5 del personaggio',
            category: 'progression',
            icon: '⭐',
            condition: (playerState) => Math.floor(playerState.experience / 100) >= 5
        },
        
        force_of_nature: {
            id: 'force_of_nature',
            name: 'Forza della Natura',
            description: 'Porta una statistica base a 15',
            category: 'progression',
            icon: '💪',
            condition: (playerState) => {
                const stats = playerState.stats || {};
                return Object.values(stats).some(stat => stat >= 15);
            }
        },
        
        complete_arsenal: {
            id: 'complete_arsenal',
            name: 'Arsenale Completo',
            description: 'Equipaggia contemporaneamente un\'arma e un\'armatura craftate da te',
            category: 'crafting',
            icon: '⚔️',
            condition: (playerState) => {
                const weapon = playerState.equippedWeapon;
                const armor = playerState.equippedArmor;
                return weapon?.isCrafted && armor?.isCrafted;
            }
        },
        
        // === TROFEI LEGATI ALLA STORIA E ALLA LORE ===
        echo_of_departure: {
            id: 'echo_of_departure',
            name: 'L\'Eco della Partenza',
            description: 'Accetta la missione di tuo padre',
            category: 'story',
            icon: '📜',
            condition: (playerState) => playerState.seenLoreEvents?.includes('lore_echo_of_departure')
        },
        
        whispers_from_past: {
            id: 'whispers_from_past',
            name: 'Sussurri dal Passato',
            description: 'Ritrova un oggetto appartenuto a Lena',
            category: 'story',
            icon: '🎵',
            condition: (playerState) => playerState.seenLoreEvents?.includes('lore_whispers_from_past')
        },
        
        echoes_of_war: {
            id: 'echoes_of_war',
            name: 'Echi della Guerra Inespressa',
            description: 'Scopri un frammento della verità sulla catastrofe',
            category: 'story',
            icon: '💥',
            condition: (playerState) => playerState.seenLoreEvents?.includes('lore_echoes_of_unexpressed_war')
        },
        
        voice_in_static: {
            id: 'voice_in_static',
            name: 'La Voce nella Statico',
            description: 'Intercetta la misteriosa trasmissione radio',
            category: 'story',
            icon: '📻',
            condition: (playerState) => playerState.seenLoreEvents?.includes('lore_radio_interception')
        },
        
        guardian_overcome: {
            id: 'guardian_overcome',
            name: 'Il Guardiano Superato',
            description: 'Affronta e supera l\'ultima prova prima della meta',
            category: 'story',
            icon: '🛡️',
            condition: (playerState) => playerState.seenLoreEvents?.includes('lore_guardian_of_threshold')
        },
        
        hidden_valley: {
            id: 'hidden_valley',
            name: 'La Valle Nascosta',
            description: 'Raggiungi la destinazione indicata da tuo padre',
            category: 'story',
            icon: '🏔️',
            condition: (playerState) => playerState.seenLoreEvents?.includes('lore_hidden_valley')
        },
        
        lost_archivist: {
            id: 'lost_archivist',
            name: 'Archivista del Perduto',
            description: 'Colleziona 10 diversi frammenti di lore',
            category: 'collection',
            icon: '📚',
            condition: (playerState) => (playerState.loreFragmentsCollected || 0) >= 10
        },
        
        // === TROFEI LEGATI A SCELTE ED EVENTI SPECIFICI ===
        fearless_heart: {
            id: 'fearless_heart',
            name: 'Cuore Impavido (o Folle?)',
            description: 'Affronta un Orrore Indicibile e sopravvivi',
            category: 'courage',
            icon: '👹',
            condition: (playerState) => playerState.facedHorrorAndSurvived === true
        },
        
        desolation_diplomat: {
            id: 'desolation_diplomat',
            name: 'Diplomatico della Desolazione',
            description: 'Risolvi un incontro con i Predoni parlando, senza combattere',
            category: 'social',
            icon: '🤝',
            condition: (playerState) => playerState.peacefulResolutions >= 1
        },
        
        good_samaritan: {
            id: 'good_samaritan',
            name: 'Buon Samaritano',
            description: 'Aiuta il Viandante Ferito offrendo tutte le tue risorse mediche',
            category: 'moral',
            icon: '❤️',
            condition: (playerState) => playerState.helpedWandererCompletely === true
        },
        
        helping_hand: {
            id: 'helping_hand',
            name: 'Mano Amica (o Calcolatrice?)',
            description: 'Completa con successo uno dei Dilemmi Morali principali',
            category: 'moral',
            icon: '⚖️',
            condition: (playerState) => playerState.moralDilemmasCompleted >= 1
        },
        
        skilled_hunter: {
            id: 'skilled_hunter',
            name: 'Cacciatore Abile',
            description: 'Sconfiggi 5 nemici',
            category: 'combat',
            icon: '🏹',
            condition: (playerState) => (playerState.enemiesDefeated || 0) >= 5
        },
        
        // === TROFEI DI ESPLORAZIONE E SCOPERTA ===
        unknown_cartographer: {
            id: 'unknown_cartographer',
            name: 'Cartografo dell\'Ignoto',
            description: 'Visita almeno una casella per ogni tipo di bioma',
            category: 'exploration',
            icon: '🧭',
            condition: (playerState) => {
                const biomes = ['P', 'F', 'R', 'V', 'C', 'M', 'R'];
                return biomes.every(biome => playerState.visitedBiomes?.includes(biome));
            }
        },
        
        carillon_mystery: {
            id: 'carillon_mystery',
            name: 'Mistero del Carillon',
            description: 'Trova il carillon di metallo arrugginito',
            category: 'discovery',
            icon: '🎶',
            condition: (playerState) => playerState.foundCarillon === true
        },
        
        angels_or_demons: {
            id: 'angels_or_demons',
            name: 'Angeli o Demoni?',
            description: 'Assisti a un\'azione degli "Angeli della Cenere"',
            category: 'discovery',
            icon: '😇',
            condition: (playerState) => playerState.witnessedAngels === true
        },
        
        ravens_secrets: {
            id: 'ravens_secrets',
            name: 'Segreti dei Corvi',
            description: 'Scopri una postazione nascosta dei "Corvi Neri"',
            category: 'discovery',
            icon: '🐦',
            condition: (playerState) => playerState.foundRavenOutpost === true
        }
    },
    
    // Stato degli achievement sbloccati
    unlockedAchievements: [],
    
    // Inizializza il sistema
    init() {
        // Carica achievement salvati
        const saved = localStorage.getItem('safeplace_achievements');
        if (saved) {
            this.unlockedAchievements = JSON.parse(saved);
        }
        
        // Controlla achievement automatici
        this.checkAutomatic();
    },
    
    // Controlla gli achievement automatici
    checkAutomatic() {
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.automatic && !this.isUnlocked(achievement.id)) {
                this.unlock(achievement.id);
            }
        });
    },
    
    // Controlla se un achievement è sbloccato
    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    },
    
    // Sblocca un achievement
    unlock(achievementId) {
        if (this.isUnlocked(achievementId)) return false;
        
        const achievement = this.achievements[achievementId];
        if (!achievement) return false;
        
        this.unlockedAchievements.push(achievementId);
        this.save();
        this.showNotification(achievement);
        
        return true;
    },
    
    // Mostra notifica di achievement sbloccato
    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-unlocked">TROFEO SBLOCCATO!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animazione
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
        
        // Messaggio anche nel log
        if (typeof addMessage === 'function') {
            addMessage(`🏆 TROFEO SBLOCCATO: ${achievement.name}!`, 'achievement');
        }
    },
    
    // Controlla tutti gli achievement basati sullo stato corrente
    checkAll(playerState) {
        Object.values(this.achievements).forEach(achievement => {
            if (!this.isUnlocked(achievement.id) && 
                !achievement.automatic && 
                achievement.condition(playerState)) {
                this.unlock(achievement.id);
            }
        });
    },
    
    // Salva gli achievement
    save() {
        localStorage.setItem('safeplace_achievements', JSON.stringify(this.unlockedAchievements));
    },
    
    // Ottieni statistiche
    getStats() {
        return {
            unlocked: this.unlockedAchievements.length,
            total: Object.keys(this.achievements).length,
            percentage: Math.floor((this.unlockedAchievements.length / Object.keys(this.achievements).length) * 100)
        };
    },
    
    // Mostra lista achievement (per menu/debug)
    showList() {
        const categories = {
            progression: 'Progressione',
            survival: 'Sopravvivenza',
            story: 'Storia',
            crafting: 'Crafting',
            exploration: 'Esplorazione',
            combat: 'Combattimento',
            moral: 'Scelte Morali',
            discovery: 'Scoperta',
            collection: 'Collezione',
            courage: 'Coraggio',
            social: 'Sociale'
        };
        
        let html = '<div class="achievement-list">';
        
        Object.entries(categories).forEach(([catId, catName]) => {
            const achievements = Object.values(this.achievements).filter(a => a.category === catId);
            if (achievements.length === 0) return;
            
            html += `<div class="achievement-category">`;
            html += `<h3>${catName}</h3>`;
            
            achievements.forEach(achievement => {
                const unlocked = this.isUnlocked(achievement.id);
                html += `
                    <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                        <span class="icon">${achievement.icon}</span>
                        <span class="name">${achievement.name}</span>
                        <span class="desc">${unlocked ? achievement.description : '???'}</span>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        html += '</div>';
        return html;
    }
};

// Integrazione con il gioco
if (typeof window !== 'undefined') {
    // Inizializza al caricamento
    document.addEventListener('DOMContentLoaded', () => {
        AchievementSystem.init();
    });
    
    // Hook per controllare achievement ad ogni azione significativa
    const originalUpdateStats = window.renderStats;
    if (originalUpdateStats) {
        window.renderStats = function() {
            originalUpdateStats();
            
            // Prepara stato player completo per check achievement
            const playerState = {
                ...player,
                daysSurvived: daysSurvived,
                nightsSurvived: Math.floor(daysSurvived / 2), // Approssimazione
                tilesExplored: player.visitedTiles?.length || 0,
                craftedItems: player.craftedItems || [],
                seenLoreEvents: player.seenLoreEvents || [],
                loreFragmentsCollected: player.inventory?.filter(item => item.itemId === 'lore_fragment_item').length || 0,
                enemiesDefeated: player.enemiesDefeated || 0,
                visitedBiomes: player.visitedBiomes || [],
                // Altri flag specifici impostati dagli eventi
            };
            
            AchievementSystem.checkAll(playerState);
        };
    }
}

// Esporta per debug
window.AchievementSystem = AchievementSystem; 
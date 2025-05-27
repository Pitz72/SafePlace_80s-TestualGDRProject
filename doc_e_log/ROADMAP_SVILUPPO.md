# ROADMAP SVILUPPO - THE SAFE PLACE
## Piano di Evoluzione Semplificato per GDR Single-Player

### 🎯 **NUOVA FILOSOFIA**: Semplicità e Autenticità Anni '80

Dopo analisi approfondita, il progetto si concentra su un'esperienza **autentica** di GDR single-player anni '80, **senza complicazioni moderne** come registrazioni utente o sistemi cloud complessi.

---

### FASE 1: INTERFACCIA RETRO AUTENTICA ✅ **COMPLETATA**

#### 1.1 Trasformazione Interfaccia Testuale Anni '80 ✅
- [x] **SOLO TESTO PURO**: Eliminati completamente tutti i pulsanti grafici
- [x] **Layout Testuale**: Controlli `[W] [A] [S] [D] [SPC]` in formato ASCII
- [x] **Sistema Salvataggio Testuale**: `[F5] Salva Locale`, `[F6] Scarica File`, `[F7] Carica File`
- [x] **Struttura Righe/Colonne**: `<ul><li>` come tutto il resto dell'interfaccia
- [x] **Crafting Integrato**: `[C] Crafting` nelle statistiche, completamente testuale
- [x] **Autenticità Retrocomputazionale**: Zero elementi grafici moderni, solo caratteri
- [x] **Colori Coordinati**: Verde fosforescente (#00FF00) uniforme con tutto il sistema
- [x] **Responsività Autentica**: Layout testuale funziona universalmente

#### 1.2 Sistema Salvataggio File-Based ✅
- [x] **Funzione downloadSaveFile()**: Scarica salvataggio come file JSON
- [x] **Funzione loadSaveFile()**: Carica salvataggio da file JSON
- [x] **Interfaccia retro**: F5/F6/F7 invece di pulsanti moderni
- [x] **Compatibilità**: Mantiene localStorage come backup automatico
- [x] **Validazione**: Controllo integrità file e compatibilità versioni

#### 1.3 Vantaggi dell'Interfaccia Testuale Autentica
- ✅ **Autenticità Assoluta**: Come un vero computer anni '80, solo caratteri ASCII
- ✅ **Zero Problemi UI**: Impossibile avere problemi di layout con solo testo
- ✅ **Responsività Universale**: Funziona perfettamente su qualsiasi dispositivo
- ✅ **Controlli Naturali**: Click e tastiera su elementi testuali
- ✅ **Atmosfera Realistica**: Verde fosforescente coordinato, font monospace autentico
- ✅ **Compatibilità Totale**: Nessun browser o dispositivo escluso

---

### FASE 2: CONSOLIDAMENTO E PULIZIA ✅ **COMPLETATA v0.8.3 (Estesa a v0.8.5 con Bilanciamento Iniziale)** ⚠️ **EVENTI PROTETTI**

#### 2.1 Rimozione Complessità Backend ✅ **COMPLETATO**
- [x] **Semplificazione architettura**: Rimozione sistema dual-mode complesso
- [x] **Pulizia codice**: Eliminazione API client e character manager
- [x] **Focus localStorage + File**: Sistema ibrido semplice
- [x] **🔒 ESPANSIONE MASSIVA EVENTI**: +45 nuovi eventi aggiunti e protetti (v0.8.3)
- [x] **🔒 DATABASE CONSOLIDATO**: 77 eventi specifici totali (era 32)
- [x] **Aggiornamento Documentazione**: `README.md`, commenti versione file JS (v0.8.5)
- [x] **Bilanciamento Iniziale Risorse Sopravvivenza**: Calibrazione tassi di consumo e drop rate di cibo, acqua e medicine per migliorare la curva di difficoltà iniziale (v0.8.5).
- [x] **Introduzione Sistema di Consumo a Porzioni (v0.8.6)**: Implementata meccanica di consumo frazionato per cibo e acqua, per aumentare realismo e strategia nella gestione delle scorte. Richiede bilanciamento specifico dei costi e degli effetti per porzione.

#### 2.2 🔒 **EVENTI PROTETTI AGGIUNTI v0.8.3** - ⚠️ **NON MODIFICARE**
- **PLAINS:** +5 eventi (plains_flower_solitary → plains_fallen_scavenger) 🔒
- **FOREST:** +10 eventi (forest_sacrificial_tree → forest_exposed_roots) 🔒  
- **RIVER:** +10 eventi (river_stranded_wreck → river_message_bottle) 🔒
- **VILLAGE:** +10 eventi (village_forgotten_altar → village_echo_laughter) 🔒
- **CITY:** +10 eventi (city_devastated_library → city_intact_apartment) 🔒

⚠️ **ATTENZIONE CRITICA**: Questi 45 eventi sono ora **INTOCCABILI** per future revisioni

#### 2.2 Ottimizzazione Esperienza Utente
- [ ] **Miglioramento UI**: Interfaccia più pulita e intuitiva
- [ ] **Messaggi chiari**: Feedback utente per operazioni file
- [ ] **Gestione errori**: Validazione robusta file di salvataggio
- [ ] **Performance**: Ottimizzazione caricamento e rendering

#### 2.3 Testing e Stabilizzazione
- [ ] **Test cross-browser**: Compatibilità download/upload file
- [ ] **Test file corrotti**: Gestione errori e recovery
- [ ] **Test grandi salvataggi**: Performance con mappe estese
- [ ] **Test mobile**: Funzionalità su dispositivi touch

---

### FASE 3: ESPANSIONE CONTENUTI MASSIVA (3-4 settimane) 🆕

#### 3.1 Analisi Contenuti Attuali 📊
**STATO ATTUALE INVENTARIATO:**
- **Eventi**: 30 specifici + 6 tipologie complesse + 2 easter eggs
- **Oggetti**: 68 items (7 risorse, 12 cibo/acqua, 8 medicine, 18 armi, 6 munizioni, 8 armature, 9 strumenti/blueprint)
- **Ricette**: 8 ricette crafting base
- **Sistema Combattimento**: ASSENTE (solo skill checks narrativi)

#### 3.2 Espansione Eventi per Tipologia 🎭
- [ ] **+10 Eventi Plains**: Rovine, carovane, tempeste di sabbia, oasi
- [ ] **+10 Eventi Forest**: Alberi mutati, accampamenti, animali rari, grotte
- [ ] **+10 Eventi River**: Ponti, guadi, creature acquatiche, relitti
- [ ] **+10 Eventi Village**: Mercanti, fazioni, segreti, bunker
- [ ] **+10 Eventi City**: Grattacieli, metropolitana, gang, laboratori
- [ ] **+10 Eventi Rest Stop**: Stazioni, officine, depositi, rifugi
- [ ] **+5 Easter Eggs**: Riferimenti pop culture anni '80, segreti sviluppatori

**TARGET: 95 eventi totali (+65 nuovi)**

#### 3.3 Espansione Oggetti Massiva 🎒
- [ ] **+20 Armi**: Spade, asce, fucili, esplosivi, armi improvvisate
- [ ] **+15 Armature**: Tute, elmetti, scudi, protezioni specifiche
- [ ] **+10 Risorse**: Elettronica, chimici, combustibili, materiali rari
- [ ] **+15 Cibo/Medicine**: Stimolanti, veleni, cibi speciali, cure avanzate
- [ ] **+10 Strumenti**: Hacking tools, veicoli, comunicazioni, sopravvivenza
- [ ] **+20 Blueprint**: Ricette avanzate per tutti i nuovi oggetti

**TARGET: 158 oggetti totali (+90 nuovi)**

#### 3.4 Espansione Crafting 🔧
- [ ] **+15 Ricette Armi**: Dalla lancia al fucile improvvisato
- [ ] **+10 Ricette Armature**: Da stracci a tute da combattimento
- [ ] **+8 Ricette Medicine**: Stimolanti, antidoti, pozioni
- [ ] **+7 Ricette Strumenti**: Dispositivi elettronici, trappole, veicoli

**TARGET: 48 ricette totali (+40 nuove)**

---

### FASE 4: SISTEMA D&D ANNI '70 SEMPLIFICATO (2-3 settimane) 🎲

#### 4.1 Meccaniche Base D&D Adattate
- [ ] **Sistema Livelli**: Esperienza e crescita per Ultimo (1-10 livelli)
- [ ] **Punti Ferita Scalabili**: HP = 10 + Vigore + (Livello × 2)
- [ ] **Classe Armatura**: CA = 10 + Agilità + Armatura
- [ ] **Bonus Attacco**: +Livello + Modificatore Statistica
- [ ] **Tiri Salvezza**: Contro veleni, malattie, paura, morte

#### 4.2 Sistema Avversari
- [ ] **Bestiary Completo**: 20+ creature con statistiche D&D
- [ ] **Predoni Umani**: Diversi livelli e specializzazioni
- [ ] **Mutanti**: Creature post-apocalittiche uniche
- [ ] **Boss Encounters**: 5 nemici leggendari per aree specifiche
- [ ] **Scaling Dinamico**: Nemici si adattano al livello del giocatore

#### 4.3 Crescita Personaggio
- [ ] **Punti Esperienza**: Guadagno da combattimenti, eventi, scoperte
- [ ] **Aumento Statistiche**: +1 ogni 2 livelli a scelta
- [ ] **Abilità Speciali**: Talenti sbloccabili per livello
- [ ] **Specializzazioni**: Percorsi di crescita (Guerriero, Esploratore, Sopravvissuto)

---

### FASE 5: COMBATTIMENTO A TURNI TESTUALE (2-3 settimane) ⚔️

#### 5.1 Sistema Combattimento Base
- [ ] **Iniziativa**: Tiro d20 + Agilità per ordine turni
- [ ] **Azioni per Turno**: Attacca, Difendi, Usa Oggetto, Fuggi, Azione Speciale
- [ ] **Tiri Attacco**: d20 + Bonus vs Classe Armatura
- [ ] **Danni**: Arma + Modificatore + Bonus situazionali
- [ ] **Condizioni**: Ferito, Avvelenato, Stordito, Spaventato

#### 5.2 Interfaccia Combattimento Testuale
- [ ] **ASCII Art Arena**: Rappresentazione posizioni combattenti
- [ ] **Menu Azioni**: Lista testuale con hotkeys [A]ttacca, [D]ifendi, etc.
- [ ] **Log Combattimento**: Cronologia dettagliata azioni e risultati
- [ ] **Barra HP Testuale**: `[████████░░] 80/100 HP`
- [ ] **Indicatori Status**: `[FERITO] [AVVELENATO]` in tempo reale

#### 5.3 Meccaniche Avanzate
- [ ] **Combattimento Multiplo**: Fino a 3 nemici contemporaneamente
- [ ] **Tattiche**: Posizionamento, coperture, imboscate
- [ ] **Armi Speciali**: Effetti unici per tipo arma
- [ ] **Magie/Tecnologie**: Abilità speciali post-apocalittiche
- [ ] **Fuga Dinamica**: Possibilità di ritirata con conseguenze

---

### FASE 6: STORIA PRINCIPALE E MAPPA PROCEDURALE (2-3 settimane) 🗺️

#### 6.1 Eventi Storia Principale
- [ ] **10 Punti Narrativi**: Eventi chiave distribuiti sulla mappa
- [ ] **Sequenza Logica**: Progressione storia nonostante mappa procedurale
- [ ] **Checkpoint System**: Trigger basati su esplorazione/livello
- [ ] **Multiple Endings**: 3-5 finali diversi basati su scelte
- [ ] **Lore Integrato**: Frammenti storia collegati agli eventi principali

#### 6.2 Adattamento Mappa Procedurale
- [ ] **Zone Narrative**: Aree speciali che appaiono sempre
- [ ] **Trigger Distanza**: Eventi attivati da distanza dal centro
- [ ] **Landmark System**: Punti fissi per eventi storia
- [ ] **Breadcrumb Trail**: Indizi che guidano verso obiettivi
- [ ] **Dynamic Scaling**: Difficoltà eventi scala con progressione

#### 6.3 Integrazione Sistemi
- [ ] **Combattimento + Storia**: Boss fights negli eventi principali
- [ ] **Crafting + Progressione**: Oggetti unici per avanzare storia
- [ ] **Livelli + Narrative**: Gating basato su potenza personaggio
- [ ] **Scelte + Conseguenze**: Decisioni influenzano eventi futuri

---

### FASE 7: BILANCIAMENTO E POLISH (2-3 settimane) ⚖️

#### 7.1 Bilanciamento Sistemi
- [ ] **Curve Esperienza**: Progressione livelli equilibrata
- [ ] **Economia Oggetti**: Rarità e valore items bilanciati
- [ ] **Difficoltà Combattimenti**: Scaling nemici ottimizzato
- [ ] **Risorse Sopravvivenza**: Cibo/acqua/medicine calibrati (include bilanciamento fine del sistema a porzioni introdotto in v0.8.6).
- [ ] **RNG Mitigation**: Sistemi anti-sfortuna per eventi critici

#### 7.2 Testing Intensivo
- [ ] **Playtest Completi**: Partite dall'inizio alla fine
- [ ] **Bug Hunting**: Ricerca sistematica errori
- [ ] **Performance**: Ottimizzazione per dispositivi lenti
- [ ] **Save Compatibility**: Test retrocompatibilità salvataggi
- [ ] **Edge Cases**: Gestione situazioni limite

#### 7.3 Qualità della Vita
- [ ] **Tutorial Esteso**: Guida completa per nuovi giocatori
- [ ] **Hotkeys Avanzate**: Scorciatoie per azioni comuni
- [ ] **Auto-Save Intelligente**: Backup automatici in momenti chiave
- [ ] **Statistics Tracking**: Statistiche dettagliate progressi
- [ ] **Accessibility**: Miglioramenti per diversi tipi di utenti

---

### MILESTONE AGGIORNATE

| Fase | Durata | Deliverable Principale | Contenuti |
|------|--------|------------------------|-----------|
| 1 | ✅ Completata | Sistema file-based funzionante | Interfaccia retro autentica |
| 2 | 1-2 sett | Architettura semplificata | Pulizia codice backend |
| 3 | 3-4 sett | Contenuti massivamente espansi | +65 eventi, +90 oggetti, +40 ricette |
| 4 | 2-3 sett | Sistema D&D implementato | Livelli, statistiche, crescita |
| 5 | 2-3 sett | Combattimento a turni | Sistema tattico completo |
| 6 | 2-3 sett | Storia principale | 10 eventi narrativi + integrazione |
| 7 | 2-3 sett | Versione finale bilanciata | Testing e polish completo |

**TOTALE STIMATO: 13-20 settimane** (3-5 mesi)

---

### CONTENUTI TARGET FINALI 🎯

#### **Eventi**: 95 totali
- 65 eventi specifici per tile (vs 30 attuali)
- 6 tipologie eventi complessi (invariato)
- 7 easter eggs (vs 2 attuali)

#### **Oggetti**: 158 totali  
- 90 nuovi oggetti (vs 68 attuali)
- Tutte le categorie espanse significativamente
- Focus su varietà armi e armature

#### **Ricette**: 48 totali
- 40 nuove ricette (vs 8 attuali)
- Crafting per ogni categoria oggetti
- Progressione da base ad avanzato

#### **Sistemi Gameplay**
- Sistema D&D completo con livelli 1-10
- Combattimento a turni tattico
- Storia principale con 10 eventi chiave
- Bilanciamento professionale

---

### VANTAGGI DELLA NUOVA DIREZIONE

#### 🎮 **Per i Giocatori**
- **Contenuti Massicci**: 3x eventi, 2.3x oggetti, 6x ricette
- **Profondità Meccanica**: Sistema D&D autentico anni '70
- **Combattimento Tattico**: Vero sistema a turni strategico
- **Storia Coinvolgente**: Narrativa principale strutturata
- **Replay Value**: Mappa procedurale + scelte multiple

#### 🛠️ **Per lo Sviluppo**
- **Struttura Chiara**: Fasi ben definite e misurabili
- **Crescita Organica**: Ogni fase costruisce sulla precedente
- **Testing Continuo**: Validazione ad ogni milestone
- **Modularità**: Sistemi indipendenti ma integrati
- **Scalabilità**: Facile aggiungere contenuti futuri

#### 🎯 **Per il Progetto**
- **Ambizione Realistica**: Obiettivi sfidanti ma raggiungibili
- **Valore Aggiunto**: Trasformazione da demo a gioco completo
- **Autenticità Mantenuta**: Fedeltà all'estetica anni '80
- **Innovazione**: Combattimento testuale moderno
- **Completezza**: Esperienza GDR completa e bilanciata

---

### TECNOLOGIE FINALI

#### **Frontend Espanso**
- **HTML5 + CSS3 + JavaScript ES6**: Stack base mantenuto
- **Modular Architecture**: Sistemi separati per combattimento, crafting, storia
- **Advanced JSON**: Strutture dati complesse per salvataggi
- **Performance Optimization**: Gestione efficiente contenuti massicci
- **Responsive Design**: Interfaccia testuale adattiva

#### **Nessun Backend Richiesto**
- ❌ ~~PHP + MySQL~~
- ❌ ~~Sistema autenticazione~~
- ❌ ~~API REST~~
- ❌ ~~Infrastruttura server~~
- ✅ **100% Client-Side**: Tutto funziona offline

---

### CONCLUSIONI

Questa **roadmap espansa** trasforma il progetto da **esperimento** a **GDR completo**:
- **Contenuti Tripli**: Espansione massiva di eventi, oggetti e ricette
- **Meccaniche Autentiche**: Sistema D&D anni '70 fedele e semplificato  
- **Combattimento Strategico**: Vero sistema a turni testuale
- **Storia Strutturata**: Narrativa principale con 10 eventi chiave
- **Esperienza Completa**: Da 2-3 ore a 20-30 ore di gameplay

Il risultato sarà un **capolavoro retro-gaming** che rispetta l'autenticità anni '80 mentre offre profondità meccanica moderna.

---
*Roadmap aggiornata: 26 Maggio 2025*
*Nuova filosofia: Autenticità + Profondità = Capolavoro Retro* 
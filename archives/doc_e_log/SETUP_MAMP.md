# SETUP MAMP PER THE SAFE PLACE
## Configurazione Ambiente Sviluppo con MAMP

### 🎯 OBIETTIVO
Configurare MAMP per sviluppare il backend PHP di The Safe Place, mantenendo il focus su un roguelike single-player in stile anni '80.

### ✅ PERCORSI IDENTIFICATI
- **MAMP Directory**: `C:\MAMP`
- **PHP 8.2.14**: `C:\MAMP\bin\php\php8.2.14\php.exe` ✅ (UTILIZZATO)
- **MySQL**: `C:\MAMP\bin\mysql\bin\mysql.exe`

### 📋 CHECKLIST CONFIGURAZIONE

#### 1. Verifica Installazione MAMP ✅
- [x] **MAMP trovato in C:\MAMP**
- [x] **PHP 8.2.14 configurato** (versione ottima!)
- [ ] **Avviare MAMP**
  - Aprire applicazione MAMP
  - Cliccare "Start Servers"
  - Verificare che Apache e MySQL siano verdi
- [ ] **Testare funzionamento**
  - Aprire browser: http://localhost/
  - Dovrebbe apparire la pagina di benvenuto MAMP

#### 2. Installazione Composer ✅
- [x] **Composer-Setup.exe scaricato**
- [ ] **Configurare percorso PHP**
  - Quando richiesto, inserire: `C:\MAMP\bin\php\php8.2.14\php.exe`
  - Completare installazione
- [ ] **Test Composer**
  ```bash
  composer --version
  # Dovrebbe mostrare Composer versione
  ```

#### 3. Configurazione PATH Sistema
Per usare PHP e MySQL da command line:

**Windows PowerShell (come Amministratore):**
```powershell
# Aggiungere al PATH di sistema (percorsi specifici del tuo MAMP):
$env:PATH += ";C:\MAMP\bin\php\php8.3.1"
$env:PATH += ";C:\MAMP\bin\mysql\bin"

# Rendere permanente:
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\MAMP\bin\php\php8.3.1;C:\MAMP\bin\mysql\bin", "Machine")
```

#### 4. Test Configurazione
- [ ] **Test PHP da command line**
  ```bash
  php --version
  # Dovrebbe mostrare PHP 8.3.1
  ```
- [ ] **Test MySQL da command line**
  ```bash
  mysql --version
  # Dovrebbe mostrare MySQL versione
  ```
- [ ] **Test Composer** (dopo installazione)
  ```bash
  composer --version
  # Dovrebbe mostrare Composer versione
  ```

### 🗂️ STRUTTURA PROGETTO BACKEND

#### Directory Structure
```
SafePlace_80s-TestualGDRProject/
├── backend/                 # Nuovo: Backend PHP
│   ├── api/                # Endpoint REST API
│   ├── config/             # Configurazioni database
│   ├── models/             # Modelli dati (Player, Game, etc.)
│   ├── utils/              # Utility e helper
│   └── index.php           # Entry point API
├── js/                     # Frontend esistente
├── css/                    # Stili esistenti
├── doc_e_log/              # Documentazione
└── index.html              # Frontend esistente
```

#### 5. Configurazione Database
- [ ] **Accesso phpMyAdmin**
  - URL: http://localhost/phpMyAdmin/
  - User: root
  - Password: (di solito vuota in MAMP)
- [ ] **Creazione database**
  ```sql
  CREATE DATABASE safeplace_db;
  USE safeplace_db;
  ```

### 🎮 FOCUS ROGUELIKE SINGLE-PLAYER

#### Vantaggi Backend per Roguelike:
1. **Salvataggi Sicuri**
   - Progressione personaggio protetta
   - Backup automatici
   - Ripristino in caso di crash

2. **Generazione Procedurale Server-Side**
   - Mappe uniche e non manipolabili
   - Loot bilanciato
   - Eventi casuali autentici

3. **Meccaniche Complesse**
   - Calcoli statistiche avanzate
   - Sistema crafting elaborato
   - AI nemici sofisticata

4. **Performance**
   - Calcoli pesanti sul server
   - Client leggero e reattivo
   - Caricamento ottimizzato

### 🛠️ PROSSIMI PASSI TECNICI

#### Dopo Setup MAMP:
1. **Creare cartella backend/**
2. **Setup Composer nel progetto**
3. **Configurare autoloading PSR-4**
4. **Creare primo endpoint API**
5. **Migrare sistema salvataggio**

#### API Endpoints Prioritari:
```
POST /api/save-game        # Salvataggio partita
GET  /api/load-game        # Caricamento partita
POST /api/player-action    # Azioni giocatore
GET  /api/game-state       # Stato attuale gioco
```

### 🚨 NOTE IMPORTANTI

#### Compatibilità Retro:
- Mantenere estetica terminale anni '80
- Preservare meccaniche roguelike classiche
- Non aggiungere elementi moderni non necessari

#### Sicurezza Single-Player:
- Focus su integrità dati, non su sicurezza multi-user
- Prevenzione corruzione salvataggi
- Validazione input per stabilità

### 📞 TROUBLESHOOTING

#### Problemi Comuni MAMP:
1. **Porte occupate**: Cambiare porte Apache (80→8080) e MySQL (3306→3307)
2. **Permessi**: Eseguire MAMP come amministratore
3. **PATH non funziona**: Riavviare PowerShell dopo modifica PATH

#### Test Rapido Funzionamento:
```php
<?php
// Creare file test.php in C:\MAMP\htdocs
phpinfo();
?>
```
Aprire: http://localhost/test.php

---
*Guida aggiornata con percorsi specifici del tuo MAMP*
*PHP 8.3.1 identificato e pronto per l'uso* 
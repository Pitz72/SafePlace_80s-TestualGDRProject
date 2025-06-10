Write-Host "Inizio riorganizzazione documenti..." -ForegroundColor Green

# Crea cartelle se non esistono
$folders = @("docs_organizzati\01_FONDAMENTALI", "docs_organizzati\02_NUOVI_ADERENTI", "docs_organizzati\03_VECCHI_UTILI", "docs_organizzati\04_ARCHIVIO_OBSOLETI")
foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }
}

# FONDAMENTALI
$fondamentali = @("THE_SAFE_PLACE_MASTER_LOG_v1.2.0.md", "DOCUMENTI_ORGANIZZAZIONE_v1.2.0.md", "SESSION_009_CHIUSURA_FINALE.md", "readme.md")
foreach ($file in $fondamentali) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\01_FONDAMENTALI\" -Force
        Write-Host "Spostato: $file"
    }
}

# NUOVI ADERENTI
$nuovi = @("SESSION_009_COMPLETED_STATUS.md", "SESSION_009_GODOT_PORTING_ANTI_REGRESSION.md", "SESSION_008_FINAL_BUGFIX_STATUS.md", "DEMO_PREVIEW_SESSION008.md", "SESSION_008_INTERFACE_BUGFIX_REPORT.md", "VISUAL_IMPROVEMENTS_ROADMAP.md", "VISUAL_POLISH_TODO.md")
foreach ($file in $nuovi) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\02_NUOVI_ADERENTI\" -Force
        Write-Host "Spostato: $file"
    }
}

# VECCHI UTILI
$vecchi = @("THE_SAFE_PLACE_MASTER_LOG_v1.1.0.md", "VERIFICA_V1.0.0.md", "VERIFICA_INTEGRAZIONE_V1.0.0.md", "V1.0.0_COMMIT_README.md", "STATO_PROGETTO_V1.0.0.md", "STATO_ATTUALE_FASE_4.md", "RIEPILOGO_CONSOLIDAMENTO_v1.1.0.md", "RIEPILOGO_CONSOLIDAMENTO_v1.0.1.md", "RELEASE_v1.0.0_FINAL.md", "PROGRESSO_V1.0.0.md", "ISTRUZIONI_TEST_V1.0.0.md", "ISTRUZIONI_IMPLEMENTAZIONE_V1.0.0.md", "ISTRUZIONI_EVENTO_V1.0.0.md", "IMPLEMENTAZIONE_COMBAT_V2.md", "GITHUB_RELEASE_LOG_v1.1.0.md", "COMMIT_COMMANDS_v1.1.0.md", "CHANGELOG_V1.0.0_FINALE.md", "ANNUNCIO_V1.0.0_COMPLETO.md")
foreach ($file in $vecchi) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\03_VECCHI_UTILI\" -Force
        Write-Host "Spostato: $file"
    }
}

# ARCHIVIO OBSOLETI
$obsoleti = @("LOG_RECUPERO_FASE_1.md", "LOG_RECUPERO_FASE_2.md", "LOG_RECUPERO_FASE_3.md", "LOG_RECUPERO_FASE_4.md", "FASE_4_COMPLETATA_NEXT_STEPS.md", "FASE_5_STEP_1_COMPLETATO.md", "FASE_5_STEP_2_COMPLETATO.md", "FASE_5_STEP_2_LOG.md", "FASE_5_STEP_3_COMPLETATO.md", "FASE_5_STEP_3_LOG.md", "FASE_5_TESTING_GUIDE.md", "FASE_5_EVENT_ENGINE_V2_DESIGN.md", "FASE_6_DEMO_COMPLETA.md", "FASE_6_DESIGN_MULTIPLE_ENDINGS.md", "DOCUMENTO_RECUPERO_ARCHITETTURA_AVANZATA.md", "CONFLITTO_SISTEMI_COMBATTIMENTO.md", "TECHNICAL_CHANGELOG_v0.8.04.md", "RELEASE_NOTES_v0.8.04_PUBLIC.md", "TESTING_COMBAT_V2_RESULTS.md")
foreach ($file in $obsoleti) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\04_ARCHIVIO_OBSOLETI\" -Force
        Write-Host "Spostato: $file"
    }
}

Write-Host "Riorganizzazione completata!" -ForegroundColor Green
Write-Host "Verifica root pulita:"
Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $_.Name -ne "RIORGANIZZAZIONE_DOCUMENTI_ISTRUZIONI.md" -and $_.Name -ne "pulisci_root.ps1" } | ForEach-Object { Write-Host "Rimasto: $($_.Name)" -ForegroundColor Yellow } 
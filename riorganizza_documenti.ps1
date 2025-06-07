# SCRIPT RIORGANIZZAZIONE DOCUMENTI - THE SAFE PLACE PROJECT
# Sposta automaticamente tutti i documenti .md dalla root nelle cartelle organizzate

Write-Host "AVVIO RIORGANIZZAZIONE DOCUMENTI..." -ForegroundColor Cyan

# Verifica esistenza cartelle
$basePath = "docs_organizzati"
$folders = @("01_FONDAMENTALI", "02_NUOVI_ADERENTI", "03_VECCHI_UTILI", "04_ARCHIVIO_OBSOLETI")

foreach ($folder in $folders) {
    $fullPath = Join-Path $basePath $folder
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force
        Write-Host "✅ Creata cartella: $fullPath" -ForegroundColor Green
    }
}

# CATEGORIA 1: FONDAMENTALI
Write-Host "SPOSTAMENTO FONDAMENTALI..." -ForegroundColor Red
$fondamentali = @(
    "THE_SAFE_PLACE_MASTER_LOG_v1.2.0.md",
    "DOCUMENTI_ORGANIZZAZIONE_v1.2.0.md",
    "SESSION_009_CHIUSURA_FINALE.md",
    "readme.md"
)

foreach ($file in $fondamentali) {
    if (Test-Path $file) {
        $dest = "docs_organizzati\01_FONDAMENTALI\$file"
        if (!(Test-Path $dest)) {
            Move-Item $file "docs_organizzati\01_FONDAMENTALI\" -Force
            Write-Host "Spostato: $file" -ForegroundColor Green
        } else {
            Write-Host "Esiste già: $file" -ForegroundColor Yellow
        }
    }
}

# CATEGORIA 2: NUOVI ADERENTI (Session 008-009)
Write-Host "`n🆕 SPOSTAMENTO NUOVI ADERENTI..." -ForegroundColor Blue
$nuovi = @(
    "SESSION_009_COMPLETED_STATUS.md",
    "SESSION_009_GODOT_PORTING_ANTI_REGRESSION.md",
    "SESSION_008_FINAL_BUGFIX_STATUS.md",
    "DEMO_PREVIEW_SESSION008.md",
    "SESSION_008_INTERFACE_BUGFIX_REPORT.md",
    "VISUAL_IMPROVEMENTS_ROADMAP.md",
    "VISUAL_POLISH_TODO.md"
)

foreach ($file in $nuovi) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\02_NUOVI_ADERENTI\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# CATEGORIA 3: VECCHI UTILI (V1.0.0-V1.1.0)
Write-Host "`n🔧 SPOSTAMENTO VECCHI UTILI..." -ForegroundColor Magenta
$vecchi = @(
    "THE_SAFE_PLACE_MASTER_LOG_v1.1.0.md",
    "VERIFICA_V1.0.0.md",
    "VERIFICA_INTEGRAZIONE_V1.0.0.md",
    "V1.0.0_COMMIT_README.md",
    "STATO_PROGETTO_V1.0.0.md",
    "STATO_ATTUALE_FASE_4.md",
    "RIEPILOGO_CONSOLIDAMENTO_v1.1.0.md",
    "RIEPILOGO_CONSOLIDAMENTO_v1.0.1.md",
    "RELEASE_v1.0.0_FINAL.md",
    "PROGRESSO_V1.0.0.md",
    "ISTRUZIONI_TEST_V1.0.0.md",
    "ISTRUZIONI_IMPLEMENTAZIONE_V1.0.0.md",
    "ISTRUZIONI_EVENTO_V1.0.0.md",
    "IMPLEMENTAZIONE_COMBAT_V2.md",
    "GITHUB_RELEASE_LOG_v1.1.0.md",
    "COMMIT_COMMANDS_v1.1.0.md",
    "CHANGELOG_V1.0.0_FINALE.md",
    "ANNUNCIO_V1.0.0_COMPLETO.md"
)

foreach ($file in $vecchi) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\03_VECCHI_UTILI\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# CATEGORIA 4: ARCHIVIO OBSOLETI (Fasi 1-6, Log Recupero)
Write-Host "`n🗄️ SPOSTAMENTO ARCHIVIO OBSOLETI..." -ForegroundColor DarkGray
$obsoleti = @(
    "LOG_RECUPERO_FASE_1.md",
    "LOG_RECUPERO_FASE_2.md",
    "LOG_RECUPERO_FASE_3.md",
    "LOG_RECUPERO_FASE_4.md",
    "FASE_4_COMPLETATA_NEXT_STEPS.md",
    "FASE_5_STEP_1_COMPLETATO.md",
    "FASE_5_STEP_2_COMPLETATO.md",
    "FASE_5_STEP_2_LOG.md",
    "FASE_5_STEP_3_COMPLETATO.md",
    "FASE_5_STEP_3_LOG.md",
    "FASE_5_TESTING_GUIDE.md",
    "FASE_5_EVENT_ENGINE_V2_DESIGN.md",
    "FASE_6_DEMO_COMPLETA.md",
    "FASE_6_DESIGN_MULTIPLE_ENDINGS.md",
    "DOCUMENTO_RECUPERO_ARCHITETTURA_AVANZATA.md",
    "CONFLITTO_SISTEMI_COMBATTIMENTO.md",
    "TECHNICAL_CHANGELOG_v0.8.04.md",
    "RELEASE_NOTES_v0.8.04_PUBLIC.md",
    "TESTING_COMBAT_V2_RESULTS.md"
)

foreach ($file in $obsoleti) {
    if (Test-Path $file) {
        Move-Item $file "docs_organizzati\04_ARCHIVIO_OBSOLETI\" -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# REPORT FINALE
Write-Host "`n" + "=" * 60
Write-Host "📊 REPORT FINALE RIORGANIZZAZIONE" -ForegroundColor Cyan
Write-Host "=" * 60

foreach ($folder in $folders) {
    $fullPath = Join-Path $basePath $folder
    $count = (Get-ChildItem $fullPath -Filter "*.md" | Measure-Object).Count
    Write-Host "📁 $folder`: $count file" -ForegroundColor White
}

# Verifica file rimasti nella root
$remainingMd = Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $_.Name -ne "RIORGANIZZAZIONE_DOCUMENTI_ISTRUZIONI.md" -and $_.Name -ne "riorganizza_documenti.ps1" }
if ($remainingMd.Count -gt 0) {
    Write-Host "`n⚠️  FILE .MD ANCORA NELLA ROOT:" -ForegroundColor Yellow
    foreach ($file in $remainingMd) {
        Write-Host "  - $($file.Name)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ ROOT PULITA - TUTTI I DOCUMENTI ORGANIZZATI!" -ForegroundColor Green
}

Write-Host "`n🎉 RIORGANIZZAZIONE COMPLETATA!" -ForegroundColor Cyan
Write-Host "📁 Struttura disponibile in: docs_organizzati/" -ForegroundColor White 
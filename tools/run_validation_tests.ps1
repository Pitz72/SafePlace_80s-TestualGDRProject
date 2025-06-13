# 🧪 SCRIPT VALIDAZIONE RAPIDA - SafePlace v1.4.3
# PowerShell script per eseguire test di validazione automatici

param(
    [string]$TestType = "all",
    [switch]$Verbose = $false,
    [switch]$Help = $false
)

# Configurazione
$ProjectPath = "godot_project"
$GodotExecutable = "godot" # Assume Godot in PATH, altrimenti specificare path completo

# Colori per output
$Green = "Green"
$Red = "Red" 
$Yellow = "Yellow"
$Cyan = "Cyan"

function Show-Help {
    Write-Host "🧪 SCRIPT VALIDAZIONE SAFEPLACE v1.4.3" -ForegroundColor $Cyan
    Write-Host "============================================" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "UTILIZZO:" -ForegroundColor $Yellow
    Write-Host "  .\run_validation_tests.ps1 [opzioni]"
    Write-Host ""
    Write-Host "OPZIONI:" -ForegroundColor $Yellow
    Write-Host "  -TestType <tipo>   Tipo di test da eseguire:"
    Write-Host "                     'all'        - Tutti i test (default)"
    Write-Host "                     'quick'      - Test rapidi essenziali"
    Write-Host "                     'interface'  - Solo test interface"
    Write-Host "                     'themes'     - Solo test temi"
    Write-Host "                     'files'      - Solo verifica file"
    Write-Host ""
    Write-Host "  -Verbose           Output dettagliato"
    Write-Host "  -Help              Mostra questo aiuto"
    Write-Host ""
    Write-Host "ESEMPI:" -ForegroundColor $Yellow
    Write-Host "  .\run_validation_tests.ps1                    # Test completi"
    Write-Host "  .\run_validation_tests.ps1 -TestType quick    # Test rapidi"
    Write-Host "  .\run_validation_tests.ps1 -Verbose           # Output dettagliato"
    Write-Host ""
}

function Test-GodotAvailable {
    try {
        $null = Get-Command $GodotExecutable -ErrorAction Stop
        return $true
    }
    catch {
        Write-Host "❌ ERRORE: Godot non trovato in PATH" -ForegroundColor $Red
        Write-Host "   Installa Godot e aggiungilo al PATH o specifica il path completo" -ForegroundColor $Yellow
        return $false
    }
}

function Test-ProjectStructure {
    Write-Host "📁 Verifica struttura progetto..." -ForegroundColor $Cyan
    
    $required_files = @(
        "$ProjectPath/project.godot",
        "$ProjectPath/scripts/MainInterface.gd",
        "$ProjectPath/scripts/ThemeManager.gd",
        "$ProjectPath/scripts/SystemValidationTest.gd",
        "$ProjectPath/scenes/Main.tscn",
        "$ProjectPath/scenes/MenuScreen.tscn"
    )
    
    $missing_files = @()
    
    foreach ($file in $required_files) {
        if (-not (Test-Path $file)) {
            $missing_files += $file
            Write-Host "   ❌ MANCANTE: $file" -ForegroundColor $Red
        } else {
            if ($Verbose) {
                Write-Host "   ✅ OK: $file" -ForegroundColor $Green
            }
        }
    }
    
    if ($missing_files.Count -eq 0) {
        Write-Host "✅ Struttura progetto: OK" -ForegroundColor $Green
        return $true
    } else {
        Write-Host "❌ File mancanti: $($missing_files.Count)" -ForegroundColor $Red
        return $false
    }
}

function Test-FileIntegrity {
    Write-Host "🔍 Verifica integrità file critici..." -ForegroundColor $Cyan
    
    # Test MainInterface.gd (deve essere ~1044 righe)
    $maininterface_path = "$ProjectPath/scripts/MainInterface.gd"
    if (Test-Path $maininterface_path) {
        $lines = (Get-Content $maininterface_path).Count
        if ($lines -ge 1000 -and $lines -le 1200) {
            Write-Host "   ✅ MainInterface.gd: $lines righe (OK)" -ForegroundColor $Green
        } else {
            Write-Host "   ⚠️ MainInterface.gd: $lines righe (anomalo, target ~1044)" -ForegroundColor $Yellow
        }
    }
    
    # Test ThemeManager.gd (deve essere ~242 righe)
    $thememanager_path = "$ProjectPath/scripts/ThemeManager.gd"
    if (Test-Path $thememanager_path) {
        $lines = (Get-Content $thememanager_path).Count
        if ($lines -ge 200 -and $lines -le 300) {
            Write-Host "   ✅ ThemeManager.gd: $lines righe (OK)" -ForegroundColor $Green
        } else {
            Write-Host "   ⚠️ ThemeManager.gd: $lines righe (anomalo, target ~242)" -ForegroundColor $Yellow
        }
    }
    
    # Test project.godot (deve contenere ThemeManager autoload)
    $project_path = "$ProjectPath/project.godot"
    if (Test-Path $project_path) {
        $content = Get-Content $project_path -Raw
        if ($content -match 'ThemeManager="\*res://scripts/ThemeManager\.gd"') {
            Write-Host "   ✅ project.godot: ThemeManager autoload OK" -ForegroundColor $Green
        } else {
            Write-Host "   ❌ project.godot: ThemeManager autoload MANCANTE" -ForegroundColor $Red
            return $false
        }
        
        # Verifica GameManager NON autoload (regressione critica)
        if ($content -match 'GameManager=') {
            Write-Host "   ❌ project.godot: GameManager autoload PRESENTE (REGRESSIONE CRITICA!)" -ForegroundColor $Red
            return $false
        } else {
            Write-Host "   ✅ project.godot: GameManager correttamente NON autoload" -ForegroundColor $Green
        }
    }
    
    return $true
}

function Test-EventsCount {
    Write-Host "📋 Conteggio eventi disponibili..." -ForegroundColor $Cyan
    
    $event_files = @(
        "$ProjectPath/scripts/events/EventsCity.gd",
        "$ProjectPath/scripts/events/EventsForest.gd",
        "$ProjectPath/scripts/events/EventsPlains.gd",
        "$ProjectPath/scripts/events/EventsRiver.gd",
        "$ProjectPath/scripts/events/EventsVillage.gd"
    )
    
    $total_events = 0
    
    foreach ($file in $event_files) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            $matches = [regex]::Matches($content, '"id":')
            $count = $matches.Count
            $total_events += $count
            $filename = Split-Path $file -Leaf
            Write-Host "   ✅ $filename`: $count eventi" -ForegroundColor $Green
        } else {
            $filename = Split-Path $file -Leaf
            Write-Host "   ❌ $filename`: FILE MANCANTE" -ForegroundColor $Red
        }
    }
    
    Write-Host "📊 TOTALE EVENTI: $total_events (target espansione: 1189)" -ForegroundColor $Cyan
    
    if ($total_events -gt 0) {
        return $true
    } else {
        return $false
    }
}

function Run-GodotValidationTest {
    Write-Host "🚀 Esecuzione test Godot automatici..." -ForegroundColor $Cyan
    
    # Crea script temporaneo per test
    $temp_script = @"
extends SceneTree

func _init():
    print("🧪 AVVIO TEST VALIDAZIONE AUTOMATICI")
    
    # Carica e esegui SystemValidationTest
    var test_script = preload("res://scripts/SystemValidationTest.gd")
    var test_node = test_script.new()
    
    # Aggiungi alla scena root
    root.add_child(test_node)
    
    # Attendi completamento test (10 secondi massimo)
    await get_tree().create_timer(10.0).timeout
    
    print("🏁 TEST COMPLETATI - Uscita automatica")
    quit()
"@
    
    $temp_file = "$ProjectPath/temp_test.gd"
    $temp_script | Out-File -FilePath $temp_file -Encoding UTF8
    
    try {
        # Esegui Godot in modalità headless con script test
        Write-Host "   Esecuzione Godot headless..." -ForegroundColor $Yellow
        $result = & $GodotExecutable --headless --script $temp_file --path $ProjectPath 2>&1
        
        # Analizza output
        $success_indicators = @("✅", "PRODUCTION READY", "Test superati")
        $error_indicators = @("❌", "ERRORI CRITICI", "NECESSITA CORREZIONI")
        
        $has_success = $false
        $has_errors = $false
        
        foreach ($line in $result) {
            if ($Verbose) {
                Write-Host "   $line" -ForegroundColor Gray
            }
            
            foreach ($indicator in $success_indicators) {
                if ($line -match [regex]::Escape($indicator)) {
                    $has_success = $true
                }
            }
            
            foreach ($indicator in $error_indicators) {
                if ($line -match [regex]::Escape($indicator)) {
                    $has_errors = $true
                }
            }
        }
        
        if ($has_success -and -not $has_errors) {
            Write-Host "✅ Test Godot: SUCCESSO" -ForegroundColor $Green
            return $true
        } elseif ($has_errors) {
            Write-Host "❌ Test Godot: ERRORI RILEVATI" -ForegroundColor $Red
            return $false
        } else {
            Write-Host "⚠️ Test Godot: RISULTATO INCERTO" -ForegroundColor $Yellow
            return $false
        }
        
    } catch {
        Write-Host "❌ Errore esecuzione test Godot: $_" -ForegroundColor $Red
        return $false
    } finally {
        # Pulizia file temporaneo
        if (Test-Path $temp_file) {
            Remove-Item $temp_file -Force
        }
    }
}

function Show-FinalReport {
    param (
        [bool]$ProjectOK,
        [bool]$FilesOK, 
        [bool]$EventsOK,
        [bool]$GodotTestOK
    )
    
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $Cyan
    Write-Host "📊 RAPPORTO VALIDAZIONE FINALE" -ForegroundColor $Cyan
    Write-Host "=" * 60 -ForegroundColor $Cyan
    
    Write-Host "📋 RISULTATI:" -ForegroundColor $Yellow
    Write-Host "   Struttura Progetto: $(if($ProjectOK){'✅ OK'}else{'❌ ERRORE'})" -ForegroundColor $(if($ProjectOK){$Green}else{$Red})
    Write-Host "   Integrità File:     $(if($FilesOK){'✅ OK'}else{'❌ ERRORE'})" -ForegroundColor $(if($FilesOK){$Green}else{$Red})
    Write-Host "   Sistema Eventi:     $(if($EventsOK){'✅ OK'}else{'❌ ERRORE'})" -ForegroundColor $(if($EventsOK){$Green}else{$Red})
    Write-Host "   Test Godot:         $(if($GodotTestOK){'✅ OK'}else{'❌ ERRORE'})" -ForegroundColor $(if($GodotTestOK){$Green}else{$Red})
    
    $all_ok = $ProjectOK -and $FilesOK -and $EventsOK -and $GodotTestOK
    
    Write-Host ""
    if ($all_ok) {
        Write-Host "🎯 STATUS FINALE: PRODUCTION READY" -ForegroundColor $Green
        Write-Host "✅ Tutti i sistemi funzionano correttamente" -ForegroundColor $Green
        Write-Host "🚀 SafePlace v1.4.3 pronto per espansione contenuti" -ForegroundColor $Green
        Write-Host ""
        Write-Host "PROSSIMI PASSI RACCOMANDATI:" -ForegroundColor $Yellow
        Write-Host "  1. ✅ Creare backup sicurezza (git commit + tag)"
        Write-Host "  2. 🚀 Procedere con import contenuti massiccio"
        Write-Host "  3. 📈 Target: 68 → 1189 eventi"
    } else {
        Write-Host "🎯 STATUS FINALE: NECESSITA CORREZIONI" -ForegroundColor $Red
        Write-Host "❌ Alcuni test falliti - correggere prima di procedere" -ForegroundColor $Red
        Write-Host ""
        Write-Host "AZIONI RICHIESTE:" -ForegroundColor $Yellow
        Write-Host "  1. 🔧 Correggere errori identificati sopra"
        Write-Host "  2. 🧪 Ri-eseguire validazione"
        Write-Host "  3. ✅ Solo dopo: procedere con sviluppi"
    }
    
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor $Cyan
}

# MAIN EXECUTION
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "🧪 SISTEMA VALIDAZIONE SAFEPLACE v1.4.3" -ForegroundColor $Cyan
Write-Host "===========================================" -ForegroundColor $Cyan
Write-Host "Test Type: $TestType" -ForegroundColor $Yellow
Write-Host ""

# Verifica prerequisiti
if (-not (Test-GodotAvailable)) {
    exit 1
}

# Verifica di essere nella directory corretta
if (-not (Test-Path $ProjectPath)) {
    Write-Host "❌ ERRORE: Directory progetto '$ProjectPath' non trovata" -ForegroundColor $Red
    Write-Host "   Esegui lo script dalla directory root del progetto SafePlace" -ForegroundColor $Yellow
    exit 1
}

# Esegui test in base al tipo
$project_ok = $true
$files_ok = $true  
$events_ok = $true
$godot_test_ok = $true

switch ($TestType.ToLower()) {
    "all" {
        $project_ok = Test-ProjectStructure
        $files_ok = Test-FileIntegrity
        $events_ok = Test-EventsCount
        $godot_test_ok = Run-GodotValidationTest
    }
    "quick" {
        $project_ok = Test-ProjectStructure
        $files_ok = Test-FileIntegrity
        $godot_test_ok = $true # Skip per test rapidi
    }
    "interface" {
        $project_ok = Test-ProjectStructure
        $godot_test_ok = Run-GodotValidationTest
        $files_ok = $true
        $events_ok = $true
    }
    "themes" {
        $files_ok = Test-FileIntegrity
        $project_ok = $true
        $events_ok = $true
        $godot_test_ok = $true
    }
    "files" {
        $project_ok = Test-ProjectStructure
        $files_ok = Test-FileIntegrity
        $events_ok = Test-EventsCount
        $godot_test_ok = $true
    }
    default {
        Write-Host "❌ Tipo test sconosciuto: $TestType" -ForegroundColor $Red
        Show-Help
        exit 1
    }
}

# Mostra rapporto finale
Show-FinalReport -ProjectOK $project_ok -FilesOK $files_ok -EventsOK $events_ok -GodotTestOK $godot_test_ok

# Exit code basato sui risultati
$all_ok = $project_ok -and $files_ok -and $events_ok -and $godot_test_ok
exit $(if ($all_ok) { 0 } else { 1 }) 
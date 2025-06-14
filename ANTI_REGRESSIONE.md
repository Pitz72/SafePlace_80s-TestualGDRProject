# DOCUMENTO ANTI-REGRESSIONE SafePlace v1.9.3

## #19 - Cache Corruption Crisis & Autoload Dependencies (v1.9.3)
**PROBLEMA**: Cache corruption Godot con errori "Could not find type ThemeManager" su 25+ file
**CAUSA**: Disabilitazione ThemeManager autoload mentre file hanno dipendenze hardcoded
**SINTOMI**: 
- Errori "Parse Error: Could not find type ThemeManager" massivi
- Impossibilità caricamento progetto Godot
- File corrotti con path duplicati (res:/res:/res:/)
**SOLUZIONE APPLICATA**:
- Riabilitato ThemeManager autoload (necessario per dipendenze)
- Mantenuto CRTEffect disabilitato (evita loop dipendenze)
- Cache .godot completamente rigenerata
**PROTEZIONE**: 
- ❌ MAI disabilitare ThemeManager se file lo referenziano
- ✅ Verificare dipendenze prima di modificare autoload
- ✅ Testare caricamento progetto dopo modifiche autoload
**IMPATTO**: CRITICO - Blocco totale sviluppo 
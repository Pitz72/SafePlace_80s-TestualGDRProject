# SAFEPLACE TERMINAL INTERFACE - SESSION #008 DEMO PREVIEW

## Interfaccia Terminale Autentica (Always-Visible)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      SAFEPLACE - TERMINALE CRT 80s                                           │
├─────────────────┬─────────────────────────────────────────────────────────────┬─────────────────────────────┤
│  SOPRAVVIVENZA  │                     ┌─ MAPPA REGIONE ─┐                      │       INFO GIOCO          │
│ ═══════════════ │                                                             │ ═══════════════           │
│ Sazietà: 75     │ MMMm.:~:.CCCCCC...........MMmM....~..CCCC..M                │ Pos: (24, 9)             │
│ Idratazione: 82 │ .mMmm......CC.:.........M.:MMm.......CC....M.               │ Luogo: Pianura            │
│ Status: Normale │ ~..CCCM..........CCC.......Mm.........~M....                │ Ora: 06:00                │
│                 │ ~~.CCCMm.........CCC...MMm.Mm........MM.....                │                           │
│                 │ ~~xxxxVVx~x.....FFmmFFF......MM......MMf....                │                           │
│                 │ FFmVVVVVxxx.....M:M.:.M......MM.......Mf.M..                │                           │
│                 │ ....VV.:.....VV...V.....CCC....M...M.Mm.M...                │                           │
│  INVENTARIO     │ ......VV.VV.......V.M....C.....M...MMVVxVV..                │                           │
│ ═══════════════ │ mMm~.V.VmVmVs~..@VV...s.CC....MMMm.Mm......                 │                           │
│ Pozione (x2)    │ ~V..mVVMx.x..Fm..VmM..........MMm....Mm....                 │                           │
│ Coltello        │ ~V...VV.....x~......M......CC..MM...M.....                 │                           │
│ Stivali         │ ~......VV...M...~........CCC.MM.MM.mMfm...                 │                           │
│                 │ ~~......VV..M....M......VV...CCC...MM.M....                │                           │
│                 │ .......VV..M...........V....CM.MM.MM.MM....                │                           │
│                 │ ~M.....M...V..ff........VV...CCCC.M..M.....                │                           │
│                 │ ....MMmM....V..F..........MM........M......                │                           │
│                 │ .mmM.MM.....V........MM....M........Mm.....                │                           │
│    LOG EVENTI   │ CCCMM....MM..~....MM.......MM.....CC..M....                │      STATISTICHE        │
│ ═══════════════ │ .CCC.........~.......MMMMM......MMCCCC.....E               │ ═══════════════         │
│ [*] Benvenuto   │ .CCCCC.......~........MM........M.CCCCC....                │ HP: 80/100              │
│ Prima di...     │ .CCCCC.......~............MM....MMCCCCC....                │ FOR: 12    VIS: 8       │
│ Ti sposti...    │                                                             │ EXP: 150   AGI: 12      │
│ Tempo passato   │                                                             │ INT: 12    TRA: 12      │
│ Qualcosa si...  │                                                             │ ADA: 12    PRE: 12      │
│                 │                                                             │ PTS: 150                 │
│                 │                                                             │                          │
│                 │                                                             │                          │
├─────────────────┴─────────────────────────────────────────────────────────────┴──────────────────────────│
│                                        CONTROLLI                                                          │
│                                   ═══════════════                                                         │
│                                       [W]                                                                 │
│                                   [A][SPC][D]                                                             │
│                                       [S]                                                                 │
│                                                                                                            │
│                                   [F5] Salva Locale                                                       │
│                                   [F6] Scarica File                                                       │
│                                   [F7] Carica File                                                        │
│                                                                                                            │
│                                   WASD: Movimento                                                         │
│                                   SPACE: Passa Tempo                                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Caratteristiche Tecniche

### 🎨 **Colori CRT Autentici**
- Verde fosforescente: `#00B347` (Interface standard)  
- Verde cursore: `#20FF99` (Player @ lampeggiante)
- Giallo lampeggio: `#FFFF00` (Start S / End E)
- Sfondo: Nero profondo `#000000F2` (95% opacità)

### 🔤 **Font Monospace Sistema**
- Priorità: `Consolas → Monaco → Liberation Mono → Courier New`
- Dimensione: 14px per leggibilità ottimale
- Allineamento ASCII perfetto

### 🗺️ **Simboli Mappa Procedurali**
- `.` Pianure (verde standard)
- `F` Foreste (verde scuro)  
- `M` Montagne (marrone scuro)
- `C` Città (grigio chiaro)
- `V` Villaggi (marrone chiaro)
- `~` Fiumi (celeste)
- `S` Start (lampeggia giallo ⚡)
- `E` End (lampeggia giallo ⚡)
- `@` Player (lampeggia verde cursore ⚡)

### ⚡ **Sistema Lampeggio**
- Frequenza: 0.5 secondi
- Authentic CRT cursor blinking
- Smooth transition tra colori base e lampeggio

### 📐 **Layout Always-Visible**
- **Colonna Sinistra** (260px): Survival → Inventory → Log
- **Colonna Centro** (600px): Mappa → Controlli  
- **Colonna Destra** (250px): Info → Statistiche
- **Spacing**: 10px margini, nessuna sovrapposizione

## Controlli Semplificati

| Tasto | Azione |
|-------|--------|
| `W A S D` | Movimento direzionale |
| `SPACE` | Passa tempo (30 min) |
| `F5` | Salvataggio locale |
| `F6` | Download save |
| `F7` | Carica file |

**🚫 NESSUN POPUP** - Tutto sempre visibile!

## Integration Ready

✅ **Zero errori di parsing**  
✅ **GameManager integration**  
✅ **Player stats sync**  
✅ **Event system compatible**  
✅ **Save/Load system ready**  
✅ **ASCII Map generation**  
✅ **Authentic CRT theming**

L'interfaccia è completamente operativa e pronta per demo/testing in Godot 4.5! 
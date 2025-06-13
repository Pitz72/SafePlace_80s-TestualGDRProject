# FIXEDSYS EXCELSIOR FONT SETUP
## Font Autentico per SafePlace Terminal

**Font Primario**: Fixedsys Excelsior 3.01  
**Scopo**: Massima autenticità terminale anni '80/90  
**Status**: ✅ **CONFIGURATO NEL TEMA**

## 🔤 **PRIORITÀ FONT SAFEPLACE**

Il tema SafePlace ora utilizza questa priorità:

1. **Fixedsys Excelsior** ← Font principale autentico
2. **Fixedsys** ← Versione classica
3. **Perfect DOS VGA 437** ← Font DOS/VGA  
4. **MS DOS** ← Font MS-DOS
5. **Courier New** ← Fallback monospace
6. **Lucida Console** ← Fallback Windows
7. **Consolas** ← Fallback moderno
8. **monospace** ← Fallback sistema

## 📥 **INSTALLAZIONE FIXEDSYS EXCELSIOR**

### **Windows**:
1. Scarica da: https://github.com/kika/fixedsys
2. Installa i file `.ttf` in `C:\Windows\Fonts\`
3. Riavvia Godot

### **macOS**:
1. Scarica i font `.ttf`
2. Apri Font Book
3. Installa i font
4. Riavvia Godot

### **Linux**:
```bash
# Ubuntu/Debian
sudo mkdir -p /usr/share/fonts/truetype/fixedsys
sudo cp *.ttf /usr/share/fonts/truetype/fixedsys/
sudo fc-cache -f -v
```

## ✅ **VERIFICA INSTALLAZIONE**

Se Fixedsys Excelsior è installato correttamente:
- Testo perfettamente pixelato stile CRT
- Allineamento ASCII perfetto
- Aspetto autentico terminale retrò

Se NON è installato:
- Godot userà automaticamente i font fallback
- L'interfaccia funzionerà comunque perfettamente
- Consigliato installare per autenticità massima

## 🎯 **RISULTATO ATTESO**

Con Fixedsys Excelsior installato, SafePlace avrà:
```
╔════════════════════════════════════════════════════╗
║ SOPRAVVIVENZA │  MAPPA ASCII 250x250  │ INFO GIOCO ║  
║ ═════════════ │ ═══════════════════════ │ ══════════ ║
║ Sazietà: 98   │ ..F.C.~.M.............. │Pos:(125,125)║
║ Idratazione:97│ .F..C...M.............. │Luogo:Pianura║
║ Status: Norm  │ ..F.@...M.............. │Ora: 06:00   ║
╚════════════════════════════════════════════════════╝
```

**Font perfetto per**: Terminali, editor retrò, giochi ASCII  
**Compatibilità**: Godot 4.5+ con SystemFont  
**Encoding**: UTF-8 completo per simboli speciali 
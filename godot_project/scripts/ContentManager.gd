extends Node
class_name ContentManager

# 📄 CONTENT MANAGER SAFEPLACE
# Gestione contenuti autentici estratti dal SafePlace originale
# Testi, versioni, descrizioni dal progetto HTML/JS originale

# 🏷️ INFORMAZIONI VERSIONE AUTENTICHE
const VERSION_FULL = "v1.1.0-ULTIMO-IS-ON-THE-ROAD-AGAIN"
const VERSION_DESCRIPTION = "Ultimate Edition"
const GAME_SUBTITLE = "un gioco di Simone Pizzi"

# 📖 TESTI MENU AUTENTICI
const MAIN_TITLE = "The Safe Place"
const FOOTER_TEXT = "GDR testuale retrocomputazionale - sperimentazione cooperazione umano-LLM tramite Cursor"

# 🎮 CONTENUTI MENU
const MENU_BUTTONS = [
	{
		"id": "new_game",
		"text": "Nuova Partita",
		"description": "Inizia una nuova avventura nel Safe Place"
	},
	{
		"id": "load_game", 
		"text": "Carica Partita",
		"description": "Continua una partita salvata"
	},
	{
		"id": "story",
		"text": "Storia", 
		"description": "Scopri la storia del Safe Place"
	},
	{
		"id": "instructions",
		"text": "Istruzioni",
		"description": "Come giocare al Safe Place"
	},
	{
		"id": "settings",
		"text": "Impostazioni",
		"description": "Configura audio, video e accessibilità"
	}
]

# 📖 CONTENUTO STORIA
const STORY_CONTENT = """
[center][b]THE SAFE PLACE[/b][/center]
[center]Storia del Gioco[/center]

In un mondo post-apocalittico devastato da guerre nucleari e catastrofi ambientali, i sopravvissuti si rifugiano in bunker sotterranei chiamati "Safe Places".

Tu sei Ultimo, un esploratore coraggioso che deve attraversare le terre desolate per raggiungere il Safe Place più sicuro. Il tuo viaggio sarà pieno di pericoli: mutanti radioattivi, banditi, trappole e le insidie di un mondo morente.

Ogni decisione che prenderai influenzerà il tuo destino. Riuscirai a sopravvivere abbastanza a lungo per raggiungere la salvezza?

[b]Caratteristiche del Gioco:[/b]
• Sistema di combattimento strategico
• Gestione risorse e inventario
• Statistiche RPG avanzate
• Mappa procedurale infinita
• Eventi casuali e scelte morali
• Sistema di salvataggio completo

Il Safe Place ti aspetta... se riuscirai a raggiungerlo.
"""

# 📋 CONTENUTO ISTRUZIONI
const INSTRUCTIONS_CONTENT = """
[center][b]ISTRUZIONI DI GIOCO[/b][/center]

[b]Movimento:[/b]
• Usa i tasti freccia o WASD per muoverti
• Esplora la mappa alla ricerca del Safe Place
• Evita i pericoli segnalati con simboli rossi

[b]Statistiche:[/b]
• [color=#4EA162]Salute:[/color] La tua vitalità (0-100)
• [color=#4EA162]Fame:[/color] Devi mangiare regolarmente (0-100)
• [color=#4EA162]Sete:[/color] Trova acqua per sopravvivere (0-100)
• [color=#4EA162]Energia:[/color] Riposati quando sei stanco (0-100)

[b]Combattimento:[/b]
• Incontra nemici casuali durante l'esplorazione
• Scegli tra Attacco, Difesa, Fuga o uso Oggetti
• Le tue statistiche influenzano l'esito dei combattimenti

[b]Inventario:[/b]
• Raccogli oggetti utili durante il viaggio
• Cibo e acqua sono essenziali per la sopravvivenza
• Armi e armature migliorano le tue capacità

[b]Salvataggio:[/b]
• [color=#4EA162]F5:[/color] Salvataggio rapido
• [color=#4EA162]F6:[/color] Caricamento rapido
• Il gioco salva automaticamente i progressi

[b]Obiettivo:[/b]
Raggiungi il Safe Place prima che le tue risorse si esauriscano!
"""

# ⚙️ CONTENUTO IMPOSTAZIONI
const SETTINGS_CONTENT = """
[center][b]IMPOSTAZIONI[/b][/center]

[b]Audio:[/b]
• Volume Generale: [Slider]
• Effetti Sonori: [Slider]
• Musica di Sottofondo: [Slider]

[b]Video:[/b]
• Modalità Schermo: Finestra / Schermo Intero
• Risoluzione: 1920x1080 (Auto)
• Filtro CRT: Attivo/Disattivo

[b]Accessibilità:[/b]
• Dimensione Font: Normale / Grande / Molto Grande
• Contrasto Alto: Attivo/Disattivo
• Tempo Animazioni: Normale / Ridotto / Disattivato

[b]Gioco:[/b]
• Difficoltà: Facile / Normale / Difficile
• Salvataggio Automatico: Attivo/Disattivo
• Mostra Suggerimenti: Attivo/Disattivo

[i]Le impostazioni vengono salvate automaticamente.[/i]
"""

# 🚀 INIZIALIZZAZIONE
func _ready():
	print("📄 ContentManager: Contenuti autentici SafePlace caricati")

# 📖 METODI ACCESSO CONTENUTI
func get_main_title() -> String:
	"""Ritorna il titolo principale del gioco"""
	return MAIN_TITLE

func get_game_subtitle() -> String:
	"""Ritorna il sottotitolo del gioco"""
	return GAME_SUBTITLE

func get_version_info() -> Dictionary:
	"""Ritorna informazioni sulla versione"""
	return {
		"version": VERSION_FULL,
		"description": VERSION_DESCRIPTION,
		"display_text": "Versione: " + VERSION_DESCRIPTION
	}

func get_footer_text() -> String:
	"""Ritorna il testo del footer"""
	return FOOTER_TEXT

func get_menu_buttons() -> Array:
	"""Ritorna la configurazione dei pulsanti menu"""
	return MENU_BUTTONS

func get_button_info(button_id: String) -> Dictionary:
	"""Ritorna informazioni su un pulsante specifico"""
	for button in MENU_BUTTONS:
		if button.id == button_id:
			return button
	return {}

# 📄 CONTENUTI SCHERMATE
func get_story_content() -> String:
	"""Ritorna il contenuto della schermata Storia"""
	return STORY_CONTENT

func get_instructions_content() -> String:
	"""Ritorna il contenuto della schermata Istruzioni"""
	return INSTRUCTIONS_CONTENT

func get_settings_content() -> String:
	"""Ritorna il contenuto della schermata Impostazioni"""
	return SETTINGS_CONTENT

# 🎨 UTILITÀ FORMATTAZIONE
func format_bbcode_text(text: String, color: String = "#4EA162") -> String:
	"""Formatta un testo con BBCode e colore SafePlace"""
	return "[color=%s]%s[/color]" % [color, text]

func create_title_text(title: String) -> String:
	"""Crea un titolo formattato con BBCode"""
	return "[center][b][color=#4EA162]%s[/color][/b][/center]" % title

func create_section_text(section: String, content: String) -> String:
	"""Crea una sezione formattata"""
	return "[b][color=#4EA162]%s:[/color][/b]\n%s\n" % [section, content] 
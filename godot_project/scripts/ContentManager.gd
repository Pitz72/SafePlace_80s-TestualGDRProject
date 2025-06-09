extends Node
class_name ContentManager

# 📚 GESTIONE CONTENUTI AUTENTICI SAFEPLACE
# Contenuti estratti dalla versione HTML/JS originale
# Fonte: index.html del gioco SafePlace originale

# 📖 STORIA COMPLETA - "L'Eco del Silenzio"
const STORY_CONTENT = """L'Eco del Silenzio

Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde.

Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".

Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.

Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità.

Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.

Poi, anche il padre era partito. Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo.

Le scorte lasciate con cura si assottigliavano, e con esse la speranza. Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: "...trova il Safe Place, Ultimo. È la nostra unica possibilità..."

E così, armato di poco più che determinazione e gli insegnamenti paterni, Ultimo si preparò per il viaggio verso l'ignoto.

Il Safe Place lo aspettava da qualche parte, oltre l'orizzonte spezzato del mondo che conosceva."""

# 📋 ISTRUZIONI COMPLETE - "Figlio Mio, Ultimo..."
const INSTRUCTIONS_CONTENT = """Figlio Mio, Ultimo...

Se stai leggendo queste parole, significa che non sono tornato in tempo, e le scorte che ti ho lasciato stanno per finire. Il mio cuore è pesante, ma non c'è tempo per il dolore adesso. Devi essere forte, come ti ho insegnato. Il mondo là fuori è un lupo affamato, ma tu hai gli strumenti per non diventare la sua preda.

Ricorda le basi, sempre. La MAPPA è la tua guida; la E segna la speranza, il "Safe Place". Raggiungila. I TASTI DIREZIONALI (o W, A, S, D) saranno le tue gambe. Ogni passo ha un costo: CIBO e ACQUA sono vita. Non lasciarli mai scarseggiare, o la debolezza e il logorio degli HP ti consumeranno. Vigila sulla tua CONDIZIONE – ferite, malanni, veleni – sono nemici silenziosi.

Il tempo è un fiume crudele, il GIORNO un breve respiro prima del gelo e dei pericoli della NOTTE. Prima che il sole muoia, cerca un RIFUGIO ('R'). Lì troverai riposo fino all'alba e, con un po' di fortuna, qualcosa di utile. Esplorali di giorno, ma ricorda che ogni azione costa tempo. Villaggi ('V') e Città ('C') sono rovine piene di echi e pericoli, non fidarti ciecamente del loro apparente riparo notturno.

Il tuo INVENTARIO è piccolo, riempilo con ciò che è essenziale. Clicca su un oggetto per capire come usarlo, equipaggiarlo o, se necessario, lasciarlo andare.

La strada ti metterà di fronte a EVENTI e scelte difficili. Fidati del tuo PRESAGIO, delle tue ABILITÀ, ma soprattutto del tuo giudizio. Non tutte le lotte vanno combattute; a volte, la saggezza sta nel sapere quando fuggire.

Ti ho insegnato tutto ciò che potevo. Ora sei solo, è vero, ma non sei impreparato. La mia missione mi chiama lontano, e non so se queste parole saranno il mio ultimo abbraccio o solo un arrivederci. Ma tu, Ultimo, tu devi sopravvivere.

Trova il Safe Place.

Con tutto l'amore che un padre può dare,
Papà.

LEGENDA MAPPA:
@ = Tu (il personaggio)
E = Safe Place (Obiettivo finale)
R = Rifugio (Riposo sicuro notturno)
V = Villaggio (Ricerche e commercio)
C = Città (Risorse abbondanti, pericoli maggiori)
~ = Fiumi (Fonte di acqua)
^ = Montagne (Terreno difficile)
. = Pianura (Terreno normale)
# = Foresta (Possibili risorse, possibili pericoli)"""

# 🎮 CONTROLLI E INFORMAZIONI AGGIUNTIVE
const CONTROLS_INFO = """CONTROLLIDIGIOCO:
MOVIMENTO:
-W, A, S, Doppurefreccedirezionalipermuoversi
- SPAZIOperaspettare / riposaresulposto

SISTEMA:
- F5: Salvapartita in locale
- F6: Scaricafiledisalvataggio
- F7: Caricafiledisalvataggio
-I: Gestisciinventario
-C: Sistemacrafting
-R: Miglioraabilità

INTERFACCIA:
- Cliccasuglioggettinell'inventario per interagire
- Osserva sempre le tue statistiche vitali
- Controlla il log eventi per informazioni importanti"""

# 🔧 FUNZIONI PUBBLICHE
func get_story_content() -> String:
	"""Restituisce il contenuto completo della storia"""
	return STORY_CONTENT

func get_instructions_content() -> String:
	"""Restituisce il contenuto completo delle istruzioni"""
	return INSTRUCTIONS_CONTENT

func get_controls_info() -> String:
	"""Restituisce le informazioni sui controlli"""
	return CONTROLS_INFO

func get_full_instructions() -> String:
	"""Restituisce istruzioni complete con controlli"""
	return INSTRUCTIONS_CONTENT + "\n\n" + CONTROLS_INFO

# 🎨 FORMATTAZIONE PER DISPLAY
func format_content_for_display(content: String, add_spacing: bool = true) -> String:
	"""Formatta il contenuto per la visualizzazione nel menu"""
	if not add_spacing:
		return content

	# Aggiungi spaziatura migliore per leggibilità
	var formatted = content.replace("\n\n", "\n\n")

	# Evidenzia le parole chiave in maiuscolo
	var keywords = ["MAPPA", "INVENTARIO", "EVENTI", "HP", "CIBO", "ACQUA",
					"CONDIZIONE", "RIFUGIO", "PRESAGIO", "ABILITÀ"]

	for keyword in keywords:
		formatted = formatted.replace(keyword, "[color=yellow]" + keyword + "[/color]")

	return formatted

func get_story_for_display() -> String:
	"""Restituisce la storia formattata per il display"""
	return format_content_for_display(STORY_CONTENT)

func get_instructions_for_display() -> String:
	"""Restituisce le istruzioni formattate per il display"""
	return format_content_for_display(get_full_instructions())

# 🎯 UTILITY FUNCTIONS
func get_content_word_count(content_type: String) -> int:
	"""Restituisce il numero di parole di un contenuto"""
	var content = ""
	match content_type.to_lower():
		"story":
			content = STORY_CONTENT
		"instructions":
			content = INSTRUCTIONS_CONTENT
		"controls":
			content = CONTROLS_INFO
		_:
			return 0

	return content.split(" ").size()

func validate_content() -> bool:
	"""Valida che tutti i contenuti siano disponibili"""
	if STORY_CONTENT.is_empty():
		push_error("❌ ContentManager: Storia mancante!")
		return false

	if INSTRUCTIONS_CONTENT.is_empty():
		push_error("❌ ContentManager: Istruzioni mancanti!")
		return false

	if CONTROLS_INFO.is_empty():
		push_error("❌ ContentManager: Informazioni controlli mancanti!")
		return false

	print("✅ ContentManager: Tutti i contenuti validati correttamente")
	print("📊 Statistiche contenuti:")
	print("   - Storia: %d parole" % get_content_word_count("story"))
	print("   - Istruzioni: %d parole" % get_content_word_count("instructions"))
	print("   - Controlli: %d parole" % get_content_word_count("controls"))

	return true

# 🚀 INIZIALIZZAZIONE
func _ready():
	"""Inizializzazione del ContentManager"""
	print("🎮 ContentManager: Inizializzazione contenuti SafePlace...")

	if validate_content():
		print("✅ ContentManager: Pronto per l'uso!")
	else:
		push_error("❌ContentManager: Errorenellavalidazionecontenuti!")

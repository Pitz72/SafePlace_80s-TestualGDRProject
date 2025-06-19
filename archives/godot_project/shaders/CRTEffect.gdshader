shader_type canvas_item;

// 📺 SHADER CRT REALISTICO PER GODOT 4.5 - SafePlace Theme System
// Implementazione completa effetto terminale anni 80 con fosfori verdi

// 🎛️ PARAMETRI PRINCIPALI
uniform float scanline_intensity : hint_range(0.0, 1.0) = 0.7;
uniform float scanline_speed : hint_range(0.0, 5.0) = 2.0;
uniform float scanline_count : hint_range(100.0, 800.0) = 400.0;

// 📐 CURVATURA E DISTORSIONE
uniform float curvature_x : hint_range(0.0, 1.0) = 0.15;
uniform float curvature_y : hint_range(0.0, 1.0) = 0.15;
uniform float barrel_distortion : hint_range(0.0, 0.5) = 0.1;

// 🌈 ABERRAZIONE CROMATICA E COLORE
uniform float chromatic_aberration : hint_range(0.0, 0.02) = 0.005;
uniform float phosphor_glow : hint_range(0.0, 2.0) = 1.2;
uniform float green_tint : hint_range(0.0, 2.0) = 1.8;

// 🔆 LUMINOSITÀ E CONTRASTO
uniform float brightness : hint_range(0.0, 2.0) = 1.1;
uniform float contrast : hint_range(0.0, 3.0) = 1.3;
uniform float vignette_intensity : hint_range(0.0, 1.0) = 0.3;

// ⚡ EFFETTI DINAMICI
uniform float noise_intensity : hint_range(0.0, 0.2) = 0.03;
uniform float flicker_intensity : hint_range(0.0, 0.1) = 0.02;
uniform bool enable_effect = true;

// 🕒 VARIABILI TEMPORALI
varying vec2 screen_uv;

void vertex() {
	screen_uv = VERTEX;
}

// 🔧 FUNZIONI HELPER

// Rumore procedurale per grain
float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Curvatura CRT autentica
vec2 curve_screen(vec2 uv) {
	uv = uv * 2.0 - 1.0; // Converti a range [-1, 1]
	
	// Applica curvatura barrel
	float barrel = barrel_distortion;
	uv += uv * (uv.x * uv.x + uv.y * uv.y) * barrel;
	
	// Curvatura CRT
	uv.x *= 1.0 + pow(abs(uv.y) / curvature_x, 2.0) * curvature_x;
	uv.y *= 1.0 + pow(abs(uv.x) / curvature_y, 2.0) * curvature_y;
	
	return (uv + 1.0) * 0.5; // Riconverti a [0, 1]
}

// Vignetting radiale
float get_vignette(vec2 uv) {
	vec2 center = uv - 0.5;
	float dist = length(center);
	return 1.0 - smoothstep(0.3, 0.7, dist * vignette_intensity);
}

// Scanlines animate
float get_scanlines(vec2 uv) {
	float line = sin((uv.y + TIME * scanline_speed * 0.1) * scanline_count * 3.14159);
	return 1.0 - scanline_intensity + scanline_intensity * (0.5 + 0.5 * line);
}

// Effetto phosphor glow verde
vec3 apply_phosphor_glow(vec3 color, vec2 uv) {
	// Intensifica il verde per effetto fosforoso
	color.g *= phosphor_glow;
	color.r *= 0.3; // Riduci rosso per tinta verde
	color.b *= 0.3; // Riduci blu per tinta verde
	
	// Aggiungi glow diffuso
	float glow = 1.0 + phosphor_glow * 0.3 * sin(TIME * 3.0);
	color *= glow;
	
	return color;
}

void fragment() {
	if (!enable_effect) {
		COLOR = texture(SCREEN_TEXTURE, SCREEN_UV);
		return;
	}
	
	// 📐 Applica curvatura dello schermo
	vec2 curved_uv = curve_screen(SCREEN_UV);
	
	// 🖼️ Controlla se siamo fuori dai bordi (effetto bordo nero CRT)
	if (curved_uv.x < 0.0 || curved_uv.x > 1.0 || curved_uv.y < 0.0 || curved_uv.y > 1.0) {
		COLOR = vec4(0.0, 0.0, 0.0, 1.0);
		return;
	}
	
	// 🌈 Aberrazione cromatica RGB
	vec2 offset = vec2(chromatic_aberration, 0.0);
	float r = texture(SCREEN_TEXTURE, curved_uv - offset).r;
	float g = texture(SCREEN_TEXTURE, curved_uv).g;
	float b = texture(SCREEN_TEXTURE, curved_uv + offset).b;
	vec3 color = vec3(r, g, b);
	
	// 📺 Applica scanlines
	float scanlines = get_scanlines(curved_uv);
	color *= scanlines;
	
	// 🔆 Luminosità e contrasto
	color = (color - 0.5) * contrast + 0.5;
	color *= brightness;
	
	// 💚 Effetto phosphor glow verde CRT
	color = apply_phosphor_glow(color, curved_uv);
	
	// 🌑 Vignetting
	float vignette = get_vignette(curved_uv);
	color *= vignette;
	
	// ⚡ Rumore dinamico
	float noise = random(curved_uv + TIME) * noise_intensity;
	color += vec3(noise);
	
	// ✨ Flicker sottile
	float flicker = 1.0 + sin(TIME * 60.0) * flicker_intensity;
	color *= flicker;
	
	// 💚 Tinta verde finale per autenticità CRT
	color.g *= green_tint;
	
	// 🎯 Output finale
	COLOR = vec4(clamp(color, 0.0, 1.0), 1.0);
} 
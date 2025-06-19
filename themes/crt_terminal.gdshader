shader_type canvas_item;

// === CRT TERMINAL SHADER - THE SAFE PLACE ===
// Versione corretta che processa il contenuto dello schermo
// Simula autenticamente i terminali a fosfori verdi anni 80

// Uniform per catturare contenuto schermo (Godot 4.x)
uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

// Uniforms per controllo effetti
uniform float scanline_strength : hint_range(0.0, 1.0) = 0.3;
uniform float scanline_frequency : hint_range(100.0, 1000.0) = 300.0;
uniform float curvature : hint_range(0.0, 0.1) = 0.02;
uniform float noise_strength : hint_range(0.0, 0.3) = 0.15;
uniform float brightness : hint_range(0.5, 2.0) = 1.2;
uniform float contrast : hint_range(0.5, 2.0) = 1.1;
uniform float phosphor_persistence : hint_range(0.0, 1.0) = 0.8;
uniform float vignette_strength : hint_range(0.0, 1.0) = 0.4;

// Colori terminale CRT
uniform vec3 phosphor_color : source_color = vec3(0.0, 1.0, 0.25); // Verde fosfori
uniform vec3 background_tint : source_color = vec3(0.05, 0.1, 0.05); // Fondo verdastro

// Funzione per curvatura schermo CRT
vec2 curve_screen(vec2 uv) {
    uv = uv * 2.0 - 1.0; // Centra coordinate
    vec2 offset = abs(uv.yx) / vec2(curvature, curvature);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5; // Ritorna a spazio 0-1
    return uv;
}

// Generatore rumore vintage
float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Scanline autentiche CRT
float scanlines(vec2 uv) {
    float line = sin(uv.y * scanline_frequency) * 0.5 + 0.5;
    return 1.0 - (line * scanline_strength);
}

// Effetto vignette per bordi schermo
float vignette(vec2 uv) {
    uv *= 1.0 - uv.yx;
    float vig = uv.x * uv.y * 15.0;
    return pow(vig, vignette_strength);
}

void fragment() {
    vec2 curved_uv = curve_screen(UV);

    // Controlla se siamo fuori dallo schermo curvato
    bool is_out_of_bounds = (curved_uv.x < 0.0 || curved_uv.x > 1.0 || curved_uv.y < 0.0 || curved_uv.y > 1.0);

    if (is_out_of_bounds) {
        COLOR = vec4(0.0, 0.0, 0.0, 1.0); // Nero ai bordi
    } else {
        // Campiona contenuto dello schermo (SCREEN_TEXTURE cattura tutto)
        vec4 base_color = texture(SCREEN_TEXTURE, curved_uv);

        // Converte a luminanza per simulare monitor monocromatico
        float luminance = dot(base_color.rgb, vec3(0.299, 0.587, 0.114));

        // Applica colore fosfori verdi
        vec3 crt_color = phosphor_color * luminance * phosphor_persistence;

        // Aggiunge sfondo leggermente illuminato
        crt_color += background_tint * (1.0 - luminance) * 0.1;

        // Applica scanline
        float scanline_factor = scanlines(curved_uv);
        crt_color *= scanline_factor;

        // Aggiunge rumore vintage
        float noise = random(curved_uv + TIME * 0.1) * noise_strength;
        crt_color += vec3(noise);

        // Applica vignette
        float vig = vignette(curved_uv);
        crt_color *= vig;

        // Regola luminosità e contrasto
        crt_color = (crt_color - 0.5) * contrast + 0.5;
        crt_color *= brightness;

        // Clamp valori
        crt_color = clamp(crt_color, 0.0, 1.0);

        COLOR = vec4(crt_color, base_color.a);
    }
}
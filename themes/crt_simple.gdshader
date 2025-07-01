shader_type canvas_item;

// === SHADER CRT OVERLAY FUNZIONALE ===
// Per uso con ColorRect overlay che cattura lo schermo

// Texture dello schermo sottostante
uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

// Controlli effetto CRT
uniform float scanline_strength : hint_range(0.0, 1.0) = 0.3;
uniform float scanline_frequency : hint_range(50.0, 500.0) = 150.0;
uniform float phosphor_glow : hint_range(0.8, 2.0) = 1.2;
uniform vec3 phosphor_color : source_color = vec3(0.0, 1.0, 0.25);
uniform float noise_strength : hint_range(0.0, 0.1) = 0.02;

// Generatore rumore semplice
float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void fragment() {
    // Campiona colore dallo schermo sottostante
    vec4 screen_color = texture(SCREEN_TEXTURE, SCREEN_UV);
    
    // Converti a luminanza per monitor monocromatico
    float luminance = dot(screen_color.rgb, vec3(0.299, 0.587, 0.114));
    
    // Applica colore fosfori
    vec3 crt_color = phosphor_color * luminance * phosphor_glow;
    
    // Crea scanline orizzontali
    float scanline = sin(UV.y * scanline_frequency) * 0.5 + 0.5;
    float scanline_effect = 1.0 - (scanline * scanline_strength);
    
    // Applica scanline
    crt_color *= scanline_effect;
    
    // Aggiungi rumore vintage leggero
    float noise = random(UV + TIME * 0.1) * noise_strength;
    crt_color += vec3(noise);
    
    // Output finale con trasparenza
    COLOR = vec4(crt_color, 1.0);
} 
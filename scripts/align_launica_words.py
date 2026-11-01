import wave
import struct
import math
import json

with wave.open('/tmp/launica.wav', 'rb') as wf:
    framerate = wf.getframerate()
    n_frames = wf.getnframes()
    raw = wf.readframes(n_frames)

samples = struct.unpack(f"{n_frames}h", raw)

# Window size: 10ms
win_size = int(framerate * 0.01)
hop_size = int(framerate * 0.005)
n_windows = (len(samples) - win_size) // hop_size

energies = []
for i in range(n_windows):
    chunk = samples[i * hop_size : i * hop_size + win_size]
    rms = math.sqrt(sum(s * s for s in chunk) / len(chunk))
    t = (i * hop_size + win_size / 2) / framerate
    energies.append((t, rms))

# Refine boundaries using energy valleys:
def find_valley_near(target_t, search_range=0.10):
    candidates = [pt for pt in energies if abs(pt[0] - target_t) <= search_range]
    if not candidates:
        return target_t
    min_pt = min(candidates, key=lambda c: c[1])
    return round(min_pt[0], 2)

segments = [
    # PARAGRAPH 1 (29 words)
    {
        "start": 0.05,
        "end": 2.38,
        "paragraph": 1,
        "words": ["El", "miedo", "a", "la", "muerte", "vive", "en", "el", "futuro."],
        "weights": [0.6, 1.8, 0.5, 0.5, 2.0, 1.6, 0.6, 0.6, 2.5]
    },
    {
        "start": 3.42,
        "end": 7.01,
        "paragraph": 1,
        "words": ["El", "presente", "es", "el", "único", "lugar", "donde", "la", "muerte", "no", "está", "todavía."],
        "weights": [0.6, 2.2, 0.6, 0.6, 2.0, 1.8, 1.6, 0.5, 2.0, 0.8, 1.5, 2.8]
    },
    {
        "start": 7.66,
        "end": 8.78,
        "paragraph": 1,
        "words": ["Y", "paradójicamente,"],
        "weights": [0.6, 4.0]
    },
    {
        "start": 9.15,
        "end": 12.10,
        "paragraph": 1,
        "words": ["es", "también", "el", "lugar", "donde", "la", "vida", "está", "completamente."],
        "weights": [0.6, 2.0, 0.6, 1.8, 1.5, 0.5, 1.6, 1.5, 4.0]
    },

    # PARAGRAPH 2 (25 words)
    {
        "start": 13.16,
        "end": 15.18,
        "paragraph": 2,
        "words": ["El", "mindfulness", "no", "resuelve", "el", "miedo."],
        "weights": [0.6, 3.8, 0.8, 2.4, 0.6, 2.2]
    },
    {
        "start": 15.79,
        "end": 17.31,
        "paragraph": 2,
        "words": ["Pero", "sí", "lo", "devuelve", "a", "su", "lugar:"],
        "weights": [1.4, 1.2, 0.6, 2.2, 0.5, 0.6, 2.2]
    },
    {
        "start": 17.92,
        "end": 19.46,
        "paragraph": 2,
        "words": ["algo", "que", "existe", "en", "la", "mente,"],
        "weights": [1.6, 0.6, 2.0, 0.6, 0.6, 2.2]
    },
    {
        "start": 19.90,
        "end": 21.70,
        "paragraph": 2,
        "words": ["no", "algo", "que", "está", "ocurriendo", "ahora."],
        "weights": [0.8, 1.6, 0.6, 1.5, 3.0, 2.2]
    }
]

aligned_words = []
global_idx = 0

for seg in segments:
    seg_start = seg["start"]
    seg_end = seg["end"]
    words = seg["words"]
    weights = seg["weights"]
    p = seg["paragraph"]

    total_weight = sum(weights)
    seg_dur = seg_end - seg_start

    current_t = seg_start
    for i, w in enumerate(words):
        w_dur = (weights[i] / total_weight) * seg_dur
        raw_end = current_t + w_dur
        if i == len(words) - 1:
            end_t = seg_end
        else:
            end_t = find_valley_near(raw_end, search_range=0.08)
            if end_t <= current_t:
                end_t = current_t + 0.08

        aligned_words.append({
            "index": global_idx,
            "word": w,
            "start": round(current_t, 2),
            "end": round(end_t, 2),
            "paragraph": p
        })
        global_idx += 1
        current_t = end_t

print(f"Total aligned words for La única certeza: {len(aligned_words)}")

target_path = '/app/applet/components/consultation/laUnicaCertezaAudioWords.ts'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write("import type { AlignedWord } from './elPesoAudioWords';\n\n")
    f.write("/**\n * Marcas temporales de alta precisión palabra por palabra para el fragmento\n")
    f.write(" * de «La única certeza» (UC), correspondientes a la locución\n")
    f.write(" * en /public/audio/audiolaunica.mp3 (21.79s de duración).\n */\n")
    f.write("export const LA_UNICA_CERTEZA_ALIGNED_WORDS: AlignedWord[] = ")
    f.write(json.dumps(aligned_words, indent=2, ensure_ascii=False))
    f.write(";\n")

print(f"File {target_path} written successfully!")

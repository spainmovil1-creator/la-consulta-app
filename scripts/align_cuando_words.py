import wave
import struct
import math
import json

with wave.open('/tmp/elmañana.wav', 'rb') as wf:
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
def find_valley_near(target_t, search_range=0.12):
    candidates = [pt for pt in energies if abs(pt[0] - target_t) <= search_range]
    if not candidates:
        return target_t
    min_pt = min(candidates, key=lambda c: c[1])
    return round(min_pt[0], 2)

segments = [
    # PARAGRAPH 1 (15 words)
    {
        "start": 0.05,
        "end": 3.10,
        "paragraph": 1,
        "words": ["Una", "de", "las", "distinciones", "más", "liberadoras", "que", "puedes", "hacer"],
        "weights": [1.5, 0.8, 0.8, 3.5, 1.4, 4.0, 0.8, 1.8, 1.8]
    },
    {
        "start": 3.70,
        "end": 5.65,
        "paragraph": 1,
        "words": ["es", "la", "diferencia", "entre", "predecir"],
        "weights": [0.8, 0.8, 3.2, 1.6, 2.8]
    },
    {
        "start": 6.00,
        "end": 6.85,
        "paragraph": 1,
        "words": ["y", "prepararse."],
        "weights": [0.8, 3.6]
    },

    # PARAGRAPH 2 (46 words)
    {
        "start": 7.95,
        "end": 10.45,
        "paragraph": 2,
        "words": ["La", "ansiedad", "anticipatoria", "te", "lleva", "a", "predecir:"],
        "weights": [0.8, 2.8, 4.5, 0.8, 1.8, 0.6, 2.8]
    },
    {
        "start": 11.10,
        "end": 13.45,
        "paragraph": 2,
        "words": ["a", "intentar", "saber", "de", "antemano", "qué", "va", "a", "pasar,"],
        "weights": [0.6, 2.5, 1.8, 0.8, 3.0, 1.0, 0.8, 0.6, 2.2]
    },
    {
        "start": 14.10,
        "end": 15.10,
        "paragraph": 2,
        "words": ["para", "poder", "controlarlo."],
        "weights": [1.4, 1.6, 3.5]
    },
    {
        "start": 16.15,
        "end": 18.40,
        "paragraph": 2,
        "words": ["La", "preparación", "efectiva", "hace", "algo", "diferente:"],
        "weights": [0.8, 3.8, 3.0, 1.6, 1.6, 3.0]
    },
    {
        "start": 19.05,
        "end": 21.20,
        "paragraph": 2,
        "words": ["acepta", "que", "no", "sabes", "qué", "va", "a", "pasar,"],
        "weights": [2.2, 0.8, 0.8, 1.8, 1.0, 0.8, 0.6, 2.2]
    },
    {
        "start": 21.90,
        "end": 25.65,
        "paragraph": 2,
        "words": ["e", "identifica", "qué", "puedes", "hacer", "ahora", "para", "estar", "en", "mejor", "posición,"],
        "weights": [0.6, 3.5, 1.0, 1.8, 1.6, 1.8, 1.4, 1.6, 0.8, 1.8, 3.0]
    },
    {
        "start": 25.95,
        "end": 27.90,
        "paragraph": 2,
        "words": ["independientemente", "de", "lo", "que", "ocurra."],
        "weights": [5.5, 0.8, 0.8, 0.8, 2.6]
    },

    # PARAGRAPH 3 (24 words)
    {
        "start": 29.10,
        "end": 32.35,
        "paragraph": 3,
        "words": ["La", "predicción", "consume", "energía", "sin", "producir", "seguridad", "real."],
        "weights": [0.8, 3.2, 2.5, 2.8, 1.2, 2.6, 3.2, 2.2]
    },
    {
        "start": 33.15,
        "end": 37.05,
        "paragraph": 3,
        "words": ["La", "preparación", "produce", "seguridad", "real", "sin", "necesitar", "certeza."],
        "weights": [0.8, 3.6, 2.5, 3.2, 2.2, 1.2, 3.2, 2.8]
    },
    {
        "start": 38.00,
        "end": 40.35,
        "paragraph": 3,
        "words": ["Son", "estrategias", "completamente", "diferentes,"],
        "weights": [1.4, 3.8, 4.5, 3.2]
    },
    {
        "start": 40.70,
        "end": 42.05,
        "paragraph": 3,
        "words": ["aunque", "a", "veces", "se", "confunden."],
        "weights": [1.8, 0.6, 1.8, 0.8, 3.0]
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
            end_t = find_valley_near(raw_end, search_range=0.10)
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

print(f"Total aligned words for Cuando el mañana: {len(aligned_words)}")

target_path = '/app/applet/components/consultation/cuandoElMananaAudioWords.ts'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write("import type { AlignedWord } from './elPesoAudioWords';\n\n")
    f.write("/**\n * Marcas temporales de alta precisión palabra por palabra para el fragmento\n")
    f.write(" * de «Cuando el mañana te secuestra» (CM), correspondientes a la locución\n")
    f.write(" * en /public/audio/audioelmañana.mp3 (42.11s de duración).\n */\n")
    f.write("export const CUANDO_EL_MANANA_ALIGNED_WORDS: AlignedWord[] = ")
    f.write(json.dumps(aligned_words, indent=2, ensure_ascii=False))
    f.write(";\n")

print(f"File {target_path} written successfully!")

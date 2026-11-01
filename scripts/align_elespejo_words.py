import wave
import struct
import math
import json

with wave.open('/tmp/elespejo.wav', 'rb') as wf:
    n_channels = wf.getnchannels()
    sampwidth = wf.getsampwidth()
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

# Segments definition with words and paragraph:
segments = [
    # Paragraph 1
    {
        "start": 0.05,
        "end": 2.41,
        "paragraph": 1,
        "words": ["El", "miedo", "a", "la", "irrelevancia", "no", "es", "vanidad."],
        "weights": [1, 2.5, 0.8, 1, 4.5, 1, 1, 3.2] # syllables/weight
    },
    {
        "start": 3.12,
        "end": 4.01,
        "paragraph": 1,
        "words": ["No", "es", "egoísmo."],
        "weights": [1, 1, 3.8]
    },
    {
        "start": 4.78,
        "end": 7.41,
        "paragraph": 1,
        "words": ["No", "es", "que", "estés", "obsesionada", "con", "los", "años", "que", "tienes."],
        "weights": [1, 1, 1, 2, 4.5, 1, 1, 2.2, 1, 2.5]
    },
    {
        "start": 8.26,
        "end": 10.21,
        "paragraph": 1,
        "words": ["Es", "algo", "mucho", "más", "profundo:"],
        "weights": [1, 2, 2, 1.8, 3.2]
    },
    {
        "start": 11.12,
        "end": 13.47,
        "paragraph": 1,
        "words": ["es", "el", "terror", "a", "perder", "tu", "lugar", "en", "el", "mundo."],
        "weights": [1, 1, 2.2, 0.8, 2.4, 1, 2.2, 1, 1, 2.5]
    },
    {
        "start": 14.37,
        "end": 15.20,
        "paragraph": 1,
        "words": ["A", "que", "lo", "que", "eres,"],
        "weights": [0.8, 1, 1, 1, 2]
    },
    {
        "start": 15.57,
        "end": 16.41,
        "paragraph": 1,
        "words": ["lo", "que", "aportas,"],
        "weights": [1, 1, 2.8]
    },
    {
        "start": 16.72,
        "end": 17.83,
        "paragraph": 1,
        "words": ["lo", "que", "representas,"],
        "weights": [1, 1, 3.8]
    },
    {
        "start": 18.51,
        "end": 19.81,
        "paragraph": 1,
        "words": ["vaya", "dejando", "de", "importar."],
        "weights": [2, 2.5, 1, 3.2]
    },
    # Paragraph 2
    {
        "start": 20.71,
        "end": 22.07,
        "paragraph": 2,
        "words": ["En", "palabras", "más", "sencillas:"],
        "weights": [1, 2.8, 1.8, 3.2]
    },
    {
        "start": 22.66,
        "end": 24.29,
        "paragraph": 2,
        "words": ["el", "miedo", "a", "que,", "poco", "a", "poco,"],
        "weights": [1, 2.5, 0.8, 1.2, 2, 0.8, 2.2]
    },
    {
        "start": 24.90,
        "end": 26.49,
        "paragraph": 2,
        "words": ["vayas", "pasando", "de", "ser", "vista"],
        "weights": [2.2, 2.5, 1, 1.5, 2.5]
    },
    {
        "start": 26.98,
        "end": 27.87,
        "paragraph": 2,
        "words": ["a", "ser", "ignorada."],
        "weights": [0.8, 1.5, 3.5]
    },
    # Paragraph 3
    {
        "start": 28.87,
        "end": 30.10,
        "paragraph": 3,
        "words": ["El", "problema", "no", "eres", "tú."],
        "weights": [1, 3, 1, 2, 2]
    },
    {
        "start": 30.99,
        "end": 33.90,
        "paragraph": 3,
        "words": ["El", "problema", "es", "el", "espejo", "que", "te", "están", "poniendo", "delante,"],
        "weights": [1, 3, 1, 1, 2.5, 1, 1, 2, 2.5, 2.8]
    },
    {
        "start": 34.50,
        "end": 36.10,
        "paragraph": 3,
        "words": ["porque", "ese", "espejo", "miente."],
        "weights": [2, 1.8, 2.5, 2.8]
    }
]

# Refine boundaries using energy valleys:
def find_valley_near(target_t, search_range=0.15):
    candidates = [pt for pt in energies if abs(pt[0] - target_t) <= search_range]
    if not candidates:
        return target_t
    # Find local minimum
    min_pt = min(candidates, key=lambda c: c[1])
    return round(min_pt[0], 2)

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

print(f"Total aligned words: {len(aligned_words)}")
with open('/app/applet/components/consultation/elEspejoAudioWords.ts', 'w') as f:
    f.write("import type { AlignedWord } from './elPesoAudioWords';\n\n")
    f.write("/**\n * Marcas temporales de alta precisión palabra por palabra para el fragmento\n")
    f.write(" * de «El espejo que miente» (EM), correspondientes a la locución\n")
    f.write(" * en /public/audio/audioelespejo.mp3 (36.44s de duración).\n */\n")
    f.write("export const EL_ESPEJO_ALIGNED_WORDS: AlignedWord[] = ")
    f.write(json.dumps(aligned_words, indent=2, ensure_ascii=False))
    f.write(";\n")

print("File written successfully!")

import wave
import struct
import math
import json

with wave.open('/tmp/eleco.wav', 'rb') as wf:
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
    # PARAGRAPH 1 (34 words)
    {
        "start": 0.05,
        "end": 0.83,
        "paragraph": 1,
        "words": ["Y", "sin", "embargo,"],
        "weights": [0.6, 1.0, 2.2]
    },
    {
        "start": 1.51,
        "end": 2.71,
        "paragraph": 1,
        "words": ["he", "visto", "también", "lo", "otro:"],
        "weights": [0.6, 1.8, 2.0, 0.8, 1.8]
    },
    {
        "start": 3.67,
        "end": 6.85,
        "paragraph": 1,
        "words": ["parejas", "que", "creían", "que", "ya", "no", "había", "nada", "que", "recuperar"],
        "weights": [2.4, 0.6, 2.0, 0.6, 0.8, 0.8, 1.6, 1.6, 0.6, 3.2]
    },
    {
        "start": 7.23,
        "end": 8.92,
        "paragraph": 1,
        "words": ["y", "que,", "cuando", "finalmente"],
        "weights": [0.6, 0.8, 1.8, 3.5]
    },
    {
        "start": 9.25,
        "end": 10.81,
        "paragraph": 1,
        "words": ["se", "dijeron", "lo", "que", "llevaban", "años", "callando,"],
        "weights": [0.6, 2.2, 0.6, 0.6, 2.2, 1.5, 2.5]
    },
    {
        "start": 11.56,
        "end": 13.42,
        "paragraph": 1,
        "words": ["descubrieron", "que", "seguía", "habiendo", "algo."],
        "weights": [3.5, 0.6, 2.0, 2.2, 1.8]
    },

    # PARAGRAPH 2 (20 words)
    {
        "start": 14.46,
        "end": 16.14,
        "paragraph": 2,
        "words": ["Que", "el", "amor", "no", "había", "desaparecido,"],
        "weights": [0.6, 0.6, 1.8, 0.8, 1.6, 4.0]
    },
    {
        "start": 16.69,
        "end": 19.70,
        "paragraph": 2,
        "words": ["sino", "que", "se", "había", "sepultado", "bajo", "el", "peso", "del", "silencio"],
        "weights": [1.4, 0.6, 0.6, 1.6, 3.2, 1.6, 0.6, 1.6, 0.8, 2.4]
    },
    {
        "start": 20.03,
        "end": 21.65,
        "paragraph": 2,
        "words": ["y", "del", "resentimiento", "acumulado."],
        "weights": [0.6, 0.8, 4.5, 3.5]
    },

    # PARAGRAPH 3 (14 words)
    {
        "start": 22.62,
        "end": 25.17,
        "paragraph": 3,
        "words": ["Y", "que,", "con", "trabajo", "y", "voluntad", "de", "ambas", "partes,"],
        "weights": [0.6, 0.8, 0.8, 2.4, 0.6, 2.8, 0.6, 1.8, 2.0]
    },
    {
        "start": 25.74,
        "end": 27.50,
        "paragraph": 3,
        "words": ["era", "posible", "volver", "a", "encontrarse."],
        "weights": [1.4, 2.2, 2.0, 0.6, 3.5]
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

print(f"Total aligned words for El eco del silencio: {len(aligned_words)}")

target_path = '/app/applet/components/consultation/elEcoDelSilencioAudioWords.ts'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write("import type { AlignedWord } from './elPesoAudioWords';\n\n")
    f.write("/**\n * Marcas temporales de alta precisión palabra por palabra para el fragmento\n")
    f.write(" * de «El eco del silencio» (ES), correspondientes a la locución\n")
    f.write(" * en /public/audio/audioeleco.mp3 (27.64s de duración).\n */\n")
    f.write("export const EL_ECO_DEL_SILENCIO_ALIGNED_WORDS: AlignedWord[] = ")
    f.write(json.dumps(aligned_words, indent=2, ensure_ascii=False))
    f.write(";\n")

print(f"File {target_path} written successfully!")

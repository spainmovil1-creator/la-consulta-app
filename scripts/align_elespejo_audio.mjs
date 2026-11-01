import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function alignAudio() {
  const audioBuffer = fs.readFileSync(path.join(process.cwd(), 'public/audio/audioelespejo.mp3'));
  const base64Audio = audioBuffer.toString('base64');

  const prompt = `
You are an expert audio-to-text alignment engineer.
Attached is the audio recording (MP3, ~36.44s) of Elena Vargas reading the following passage from the book "El espejo que miente":

[PARAGRAPH 1]
El miedo a la irrelevancia no es vanidad. No es egoísmo. No es que estés obsesionada con los años que tienes. Es algo mucho más profundo: es el terror a perder tu lugar en el mundo. A que lo que eres, lo que aportas, lo que representas, vaya dejando de importar.

[PARAGRAPH 2]
En palabras más sencillas: el miedo a que, poco a poco, vayas pasando de ser vista a ser ignorada.

[PARAGRAPH 3]
El problema no eres tú. El problema es el espejo que te están poniendo delante, porque ese espejo miente.

Listen closely to the audio. Verify the exact spoken words and time each word with high precision.
Return a valid JSON array of objects representing each spoken word in exact sequence from 0.0s to the end of the recording.
Each object must have the schema:
{
  "index": number, // 0-based sequential integer
  "word": string, // exact word with punctuation as spoken
  "start": number, // start time in seconds (float, 2 decimals)
  "end": number, // end time in seconds (float, 2 decimals)
  "paragraph": number // 1, 2, or 3
}

IMPORTANT:
- Total duration is 36.44 seconds.
- Every word spoken must be included.
- Times must be strictly increasing: start < end, next.start >= prev.start.
- Return ONLY the raw JSON array.
`;

  console.log('Analyzing audio with gemini-3.8-flash...');
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [
      {
        inlineData: {
          mimeType: 'audio/mp3',
          data: base64Audio,
        },
      },
      {
        text: prompt,
      },
    ],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const jsonText = response.text;
  console.log('Response received, length:', jsonText.length);
  fs.writeFileSync(path.join(process.cwd(), 'public/audio/elespejo_words_timing.json'), jsonText);
  console.log('Saved to public/audio/elespejo_words_timing.json');
}

alignAudio().catch(console.error);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  
  const { imageBase64 } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

  try {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/jpeg';

    const promptText = "Eres un asistente experto en transcripción. Extrae todo el texto de esta imagen de distribución de turnos. Devuelve el texto limpio, manteniendo cada persona y su puesto en una línea separada. No añadas introducciones ni formato markdown.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);
    
    const rawText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: rawText });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

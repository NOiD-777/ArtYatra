import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: "AIzaSyBbRVwFsfCvRyvu_-wswXjESh6DoO-DWcE" 
});

export interface ArtClassificationResult {
  artStyleName: string;
  confidence: number;
  reasoning: string;
}

export async function classifyIndianArt(imageBase64: string): Promise<ArtClassificationResult> {
  try {
    const prompt = `Analyze this image and classify it as one of these traditional Indian art styles:
    
    1. Warli Art - Tribal art from Maharashtra with geometric patterns
    2. Pochampally Ikat - Tie-dye textile art from Telangana
    3. Thanjavur Painting - Classical painting from Tamil Nadu with gold foil
    4. Madhubani Painting - Folk art from Bihar with vibrant colors
    5. Kalamkari - Hand-painted textile art from Andhra Pradesh
    6. Pattachitra - Traditional painting from Odisha
    7. Gond Art - Tribal art from Central India
    8. Pichwai Painting - Religious art from Rajasthan
    
    Respond with JSON in this exact format:
    {
      "artStyleName": "exact name from the list above",
      "confidence": number between 0 and 100,
      "reasoning": "brief explanation of why this classification was chosen"
    }
    
    If the image doesn't clearly match any of these styles, choose the closest match and indicate lower confidence.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            artStyleName: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["artStyleName", "confidence", "reasoning"],
        },
      },
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        },
        prompt,
      ],
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    const result: ArtClassificationResult = JSON.parse(rawJson);
    
    // Validate confidence is within range
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to classify artwork: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateWelcomeMessage = async (guestName: string, roomName: string, guestHouseName: string): Promise<string> => {
  if (!API_KEY) {
    return `${guestName}님, ${guestHouseName}에 오신 것을 환영합니다! ${roomName}에서 편안한 시간 보내시길 바랍니다.`;
  }

  const prompt = `${guestHouseName}에 체크인하는 ${guestName}님을 위한 환영 메시지를 작성해줘. 방은 ${roomName}이야. 친절하고 따뜻한 느낌으로, 주변의 가볼 만한 곳 한두 군데를 추천해줘. 메시지는 한국어로 작성하고, 간결하게 만들어줘.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || `${guestName}님, ${guestHouseName}에 오신 것을 환영합니다!`;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `[AI 메시지 생성 실패] ${guestName}님, ${guestHouseName}에 오신 것을 환영합니다! ${roomName}에서 편안한 시간 보내시길 바랍니다.`;
  }
};

export const getWeatherInfo = async (): Promise<{ seoul: { temp: number; weather: string }; monterrey: { temp: number; weather: string } } | null> => {
    if (!API_KEY) return null;

    // Circuit Breaker: Check if we are in a cooldown period to prevent quota usage
    const cooldownStr = localStorage.getItem('weather_api_cooldown');
    if (cooldownStr) {
        const cooldownExpiry = parseInt(cooldownStr, 10);
        if (Date.now() < cooldownExpiry) {
            console.warn("Weather API in cooldown due to previous quota limit.");
            return null;
        } else {
            localStorage.removeItem('weather_api_cooldown');
        }
    }

    // Prompt specifically requesting a JSON string format from the model using search grounding
    // We ask for a specific format because responseSchema is not supported with googleSearch tools.
    const prompt = `
    Find the current weather and temperature in Celsius for Seoul, South Korea and Monterrey, Mexico.
    Return the data strictly in the following JSON format:
    {
      "seoul": { "temp": 20, "weather": "맑음" },
      "monterrey": { "temp": 25, "weather": "구름" }
    }
    The 'weather' field must be a short Korean description (e.g., 맑음, 흐림, 비, 눈, 구름 많음).
    Do not use markdown code blocks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              // Use googleSearch to get real-time weather data
              tools: [{ googleSearch: {} }],
              // Note: responseSchema and responseMimeType cannot be used with googleSearch
            },
        });

        const text = response.text;
        if (!text) return null;

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const weatherData = JSON.parse(cleanedText);
            
            if (weatherData.seoul && weatherData.monterrey) {
                 return {
                    seoul: { 
                        temp: Number(weatherData.seoul.temp), 
                        weather: String(weatherData.seoul.weather) 
                    },
                    monterrey: { 
                        temp: Number(weatherData.monterrey.temp), 
                        weather: String(weatherData.monterrey.weather) 
                    }
                };
            }
        } catch (parseError) {
            console.warn("Failed to parse weather JSON from AI response:", parseError);
        }
        return null;

    } catch (error: any) {
        const msg = error.message || error.toString();
        // Gracefully handle API errors to prevent console spamming
        if (error.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Weather API quota exceeded. Skipping update.");
            // Set cooldown for 6 hours (6 * 60 * 60 * 1000 ms)
            localStorage.setItem('weather_api_cooldown', (Date.now() + 6 * 60 * 60 * 1000).toString());
        } else if (error.status === 500 || msg.includes('500')) {
            console.warn("Weather API internal error. Skipping update.");
        } else {
            console.error("Error fetching weather info:", error);
        }
        return null;
    }
};

export const generateBookingNotificationAudio = async (guestName: string): Promise<string | null> => {
  if (!API_KEY) return null;

  try {
    const prompt = `${guestName}님의 새로운 예약 신청이 들어왔습니다.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating booking notification audio:", error);
    return null;
  }
};

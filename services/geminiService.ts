
import { GoogleGenAI, Type } from "@google/genai";

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
    // FIX: Use response.text directly as per Gemini API guidelines.
    return response.text;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `[AI 메시지 생성 실패] ${guestName}님, ${guestHouseName}에 오신 것을 환영합니다! ${roomName}에서 편안한 시간 보내시길 바랍니다.`;
  }
};

export const getWeatherInfo = async (): Promise<{ seoul: { temp: number; weather: string }; monterrey: { temp: number; weather: string } } | null> => {
    if (!API_KEY) {
        console.warn("API_KEY is not set. Weather feature disabled.");
        return null;
    }

    const prompt = `대한민국 서울과 멕시코 몬테레이의 현재 날씨와 섭씨 온도를 알려줘. 
    날씨 설명은 '맑음', '흐림', '구름 많음', '비', '눈', '안개', '천둥번개' 중 하나로 아주 짧은 한국어 단어로 응답해줘.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              // FIX: Using responseSchema for JSON output is the recommended and most reliable method.
              // This ensures the output is always valid JSON, avoiding parsing errors.
              // Note that using googleSearch tool is not compatible with responseSchema.
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  seoul: {
                    type: Type.OBJECT,
                    properties: {
                      temp: { type: Type.NUMBER, description: "섭씨 온도" },
                      weather: { type: Type.STRING, description: "날씨 설명" },
                    },
                    required: ['temp', 'weather'],
                  },
                  monterrey: {
                    type: Type.OBJECT,
                    properties: {
                      temp: { type: Type.NUMBER, description: "섭씨 온도" },
                      weather: { type: Type.STRING, description: "날씨 설명" },
                    },
                    required: ['temp', 'weather'],
                  },
                },
                required: ['seoul', 'monterrey'],
              },
            },
        });

        // FIX: Use response.text directly as per Gemini API guidelines.
        const jsonString = response.text;
        const weatherData = JSON.parse(jsonString);
        
        // Basic validation
        if (weatherData.seoul && typeof weatherData.seoul.temp === 'number' && weatherData.monterrey && typeof weatherData.monterrey.temp === 'number') {
            return weatherData;
        } else {
            console.error("Fetched weather data has invalid format:", weatherData);
            return null;
        }

    } catch (error) {
        console.error("Error fetching or parsing weather info:", error);
        return null;
    }
};

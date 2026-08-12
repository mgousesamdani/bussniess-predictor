import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { BusinessInput, BusinessPrediction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function predictBusiness(input: BusinessInput, exclude: string[] = []): Promise<BusinessPrediction> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following business startup parameters for India and provide a data-driven prediction. 
    Simulate a Random Forest analysis based on historical Indian market data (2020-2025).
    
    Input:
    - Budget: ₹${input.budget}
    - State: ${input.state}
    - City: ${input.city || 'Not specified'}
    - Start Month: ${input.startMonth}
    - User Interest/Liked Profession: ${input.likedProfession || 'None specified. Suggest the best fit based on other parameters.'}
    
    ${exclude.length > 0 ? `IMPORTANT: DO NOT suggest any of the following businesses as they were already shown: ${exclude.join(', ')}.` : ''}

    If a User Interest is provided, prioritize analyzing its feasibility within the given budget and location. If it's not feasible, suggest the next best alternative that aligns with their interest.
    `,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          businessName: { type: Type.STRING },
          suggestedInvestment: { type: Type.NUMBER, description: "The specific investment amount recommended for this business in INR" },
          successProbability: { type: Type.NUMBER, description: "Percentage from 0-100" },
          failureRisk: { type: Type.NUMBER, description: "Percentage from 0-100" },
          profitMargin: { type: Type.NUMBER, description: "Percentage" },
          lossMargin: { type: Type.NUMBER, description: "Percentage" },
          monthlyNetProfit: { type: Type.NUMBER, description: "In INR" },
          breakEvenMonths: { type: Type.NUMBER },
          seasonalImpact: { type: Type.STRING },
          regionalDemand: { type: Type.STRING },
          marketCompetition: { type: Type.STRING },
          keyRiskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
          explanation: { type: Type.STRING, description: "A concise summary of why this business was chosen." }
        },
        required: [
          "businessName", "suggestedInvestment", "successProbability", "failureRisk", "profitMargin", 
          "lossMargin", "monthlyNetProfit", "breakEvenMonths", "seasonalImpact", 
          "regionalDemand", "marketCompetition", "keyRiskFactors", "explanation"
        ]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateSpeech(text: string, language: string = 'English'): Promise<string> {
  const prompt = `Translate the following business analysis into ${language} and then provide the TTS output: ${text}`;
  
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
  return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : "";
}

export async function getChatResponse(message: string, context: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      systemInstruction: `You are an expert Indian Business Consultant. 
      The user is considering a business with the following context: ${context}.
      Answer their doubts clearly, providing data-driven advice, local market insights for India, and practical steps. 
      Keep responses concise and professional.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

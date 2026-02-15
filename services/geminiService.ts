
import { GoogleGenAI, Type } from "@google/genai";
import { MaintenanceRequest, MessFeedback } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeFeedback = async (feedbacks: MessFeedback[]) => {
  const ai = getAI();
  const prompt = `Analyze the following mess feedback from NITJ students and provide a 2-sentence summary and one actionable improvement: ${JSON.stringify(feedbacks)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Could not generate summary at this time.";
  }
};

export const chatWithAssistant = async (message: string, context: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are the NITJ Hostel & Mess Assistant. Use this context: ${JSON.stringify(context)}. User asks: ${message}`,
    config: {
      systemInstruction: "You are a helpful assistant for NIT Jalandhar hostel residents. Be polite, concise, and provide accurate info based on the provided data.",
    }
  });
  return response.text;
};

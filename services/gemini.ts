
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a creative meal idea based on current cart items.
 */
export async function getRecipeSuggestions(items: { name: string, quantity: number }[]) {
  const prompt = `I am at a grocery store and I have these items in my cart: ${items.map(i => `${i.quantity} ${i.name}`).join(', ')}. 
  Suggest 2 quick and delicious recipes I could make with these. Format as a friendly recommendation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // The response.text property directly returns the generated string output.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate suggestions at this time.";
  }
}

/**
 * Smart Receipt Analysis: Provides nutritional insights or cost-saving tips.
 */
export async function getSmartReceiptSummary(items: { name: string, price: number }[]) {
  const prompt = `Analyze this grocery purchase: ${items.map(i => i.name).join(', ')}. 
  Provide a brief summary focusing on: 1. Nutritional balance 2. One tip for saving money next time.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // The response.text property directly returns the generated string output.
    return response.text;
  } catch (error) {
    return "Smart summary unavailable.";
  }
}

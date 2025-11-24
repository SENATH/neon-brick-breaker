import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { GeneratedLevelResponse } from '../types';
import { BRICK_ROWS, BRICK_COLS } from '../constants';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLevelWithGemini = async (prompt: string): Promise<GeneratedLevelResponse> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast and capable model

    const systemInstruction = `
      You are a level designer for a Brick Breaker game.
      The grid size is ${BRICK_ROWS} rows by ${BRICK_COLS} columns.
      You must output a 2D JSON array representing the grid.
      Values:
      0 = Empty Space
      1 = Weak Brick (Red)
      2 = Medium-Weak Brick (Orange)
      3 = Medium Brick (Yellow)
      4 = Medium-Strong Brick (Green)
      5 = Strong Brick (Blue)
      6 = Super Strong Brick (Purple)
      
      Create visually interesting patterns (skulls, hearts, pyramids, random chaos, text) based on the user prompt.
      Ensure the bottom 2-3 rows are mostly 0 (empty) to give the player space.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            layout: {
              type: Type.ARRAY,
              description: `A ${BRICK_ROWS}x${BRICK_COLS} integer grid representing the bricks.`,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.INTEGER,
                }
              }
            },
            themeName: {
              type: Type.STRING,
              description: "A short creative name for this level."
            },
            difficulty: {
              type: Type.STRING,
              description: "Estimated difficulty: Easy, Medium, Hard, or Insane."
            }
          },
          required: ["layout", "themeName", "difficulty"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as GeneratedLevelResponse;
      
      // Basic validation to ensure grid dimensions match (crop or pad if necessary)
      const validLayout = data.layout.slice(0, BRICK_ROWS).map(row => {
        const newRow = row.slice(0, BRICK_COLS);
        // Pad if short
        while (newRow.length < BRICK_COLS) newRow.push(0);
        return newRow;
      });
      // Pad rows if missing
      while (validLayout.length < BRICK_ROWS) {
        validLayout.push(new Array(BRICK_COLS).fill(0));
      }

      return {
        ...data,
        layout: validLayout
      };
    }
    
    throw new Error("No text returned from Gemini");

  } catch (error) {
    console.error("Gemini Level Generation Error:", error);
    // Fallback simple level
    const fallbackLayout = Array(BRICK_ROWS).fill(0).map((_, r) => 
      Array(BRICK_COLS).fill(0).map((_, c) => (r < 5 && (r+c)%2===0 ? 1 : 0))
    );
    return {
      layout: fallbackLayout,
      themeName: "Emergency Backup",
      difficulty: "Unknown"
    };
  }
};
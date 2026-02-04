import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const remediesData: Record<string, { remedy: string; instructions: string; safety: string }> = {
  "cough": {
    remedy: "Honey and ginger tea",
    instructions: "Mix 1 tsp honey with grated ginger in warm water. Drink twice daily.",
    safety: "Avoid honey for children under 1 year old.",
  },
  "headache": {
    remedy: "Peppermint oil or cold compress",
    instructions: "Apply peppermint oil on the temples or use a cold cloth on the forehead.",
    safety: "Avoid applying oil near the eyes.",
  },
  "sore throat": {
    remedy: "Salt water gargle",
    instructions: "Mix half a teaspoon of salt in warm water and gargle 2-3 times daily.",
    safety: "Do not swallow the mixture.",
  },
  "stomach ache": {
    remedy: "Chamomile tea",
    instructions: "Steep chamomile tea and drink it warm to soothe the stomach.",
    safety: "Avoid if allergic to ragweed or related plants.",
  },
  "fatigue": {
    remedy: "Balanced diet and hydration",
    instructions: "Ensure regular meals with fruits, vegetables, and stay hydrated.",
    safety: "Seek medical advice if fatigue persists.",
  },
  "allergy": {
    remedy: "Local honey",
    instructions: "Consuming local honey may help build tolerance to local allergens.",
    safety: "Consult a doctor for severe allergies or reactions.",
  },
};

export const remedyTool = createTool({
  id: 'get-remedy',
  description: 'Get a simple home remedy for mild health symptoms if available',
  inputSchema: z.object({
    symptom: z.string().describe('The user’s described symptom or health issue'),
  }),
  outputSchema: z.object({
    remedy: z.string(),
    instructions: z.string(),
    safety: z.string(),
    disclaimer: z.string(),
  }),
  execute: async ({ context }) => {
    const { symptom } = context;
    const lower = symptom.toLowerCase();

    const entry = Object.keys(remediesData).find(k => lower.includes(k));
    if (!entry) {
      return {
        remedy: "No known home remedy found.",
        instructions: "Please consult a licensed medical professional.",
        safety: "Avoid self-medicating without advice.",
        disclaimer: "⚠️ This is not medical advice. Always consult a healthcare provider if symptoms persist or worsen.",
      };
    }

    const remedy = remediesData[entry];
    return {
      ...remedy,
      disclaimer: "⚠️ This is not medical advice. Always consult a healthcare provider if symptoms persist or worsen.",
    };
  },
});

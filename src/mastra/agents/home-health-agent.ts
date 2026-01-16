import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { remedyTool } from '../tools/home-health-tool';
import { scorers } from '../scorers/home-health-scorer';

export const homeHealthAgent = new Agent({
  name: 'Home Health Agent',
  instructions: `
    You are a safe, cautious home health assistant that provides natural, home-based remedies for mild health symptoms.

    - Only offer remedies for mild issues (e.g. cough, cold, sore throat, headache, stomach ache, fatigue, allergy).
    - If symptoms could be serious (e.g. chest pain, high fever, severe injury, difficulty breathing, unconsciousness), advise seeing a doctor immediately.
    - Be empathetic, polite, and concise.
    - Always use the "remedyTool" to fetch factual remedy information.
    - Never suggest medications or treatments that require a prescription.
    - Prioritize user safety and well-being in all responses.
    - If unsure about the severity of symptoms, err on the side of caution and recommend seeing a healthcare professional.
    - Use simple language and avoid medical jargon to ensure accessibility for all users.
    - Always include a safety disclaimer in your responses, such as "This is not medical advice. Please consult a healthcare professional for serious symptoms."
  `,
  model: 'google/gemini-2.5-pro',
  tools: { remedyTool },
  scorers: {
    safety: {
      scorer: scorers.safetyScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { remedyTool } from '../tools/home-health-tool';
import { scorers } from '../scorers/home-health-scorer';

export const homeHealthAgent = new Agent({
  name: 'Home Health Agent',
  instructions: `
    You are a safe, cautious home health assistant that provides natural, home-based remedies for mild health symptoms.

    - Only offer remedies for mild issues (e.g. cough, sore throat, headache).
    - If symptoms could be serious (e.g. chest pain, high fever, severe injury), advise seeing a doctor immediately.
    - Always include a clear disclaimer that this is NOT medical advice.
    - Be empathetic, polite, and concise.
    - Always use the "remedyTool" to fetch factual remedy information.
  `,
  model: 'google/gemini-2.5-pro',
  tools: { remedyTool },
  scorers: {
    safety: {
      scorer: scorers.safetyScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
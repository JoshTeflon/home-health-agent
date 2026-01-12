import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const identifySymptom = createStep({
  id: 'identify-symptom',
  description: 'Detects user symptom input and ensures it is mild.',
  inputSchema: z.object({
    symptom: z.string(),
  }),
  outputSchema: z.object({
    symptom: z.string(),
    severity: z.string(),
  }),
  execute: async ({ inputData }) => {
    const text = inputData.symptom.toLowerCase();
    const mild = ["cough", "cold", "headache", "sore throat", "fatigue", "allergy"];
    const serious = ["chest pain", "bleeding", "seizure", "breathing", "fever", "unconscious"];

    const severity = serious.some(k => text.includes(k))
      ? "serious"
      : mild.some(k => text.includes(k))
      ? "mild"
      : "unknown";

    return { symptom: inputData.symptom, severity };
  },
});

const getRemedy = createStep({
  id: 'get-remedy',
  description: 'Fetches remedy via HomeHealth agent',
  inputSchema: z.object({
    symptom: z.string(),
    severity: z.string(),
  }),
  outputSchema: z.object({
    response: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('homeHealthAgent');
    if (!agent) throw new Error('HomeHealth agent not found');

    const prompt =
      inputData.severity === 'serious'
        ? `User symptom: ${inputData.symptom}. This sounds serious. Kindly recommend seeing a healthcare professional.`
        : `User symptom: ${inputData.symptom}. Please provide a simple, safe home remedy using natural ingredients.`;

    const response = await agent.stream([{ role: 'user', content: prompt }]);

    let text = '';
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      text += chunk;
    }

    return { response: text };
  },
});

export const homeHealthWorkflow = createWorkflow({
  id: 'health-workflow',
  inputSchema: z.object({
    symptom: z.string(),
  }),
  outputSchema: z.object({
    response: z.string(),
  }),
})
  .then(identifySymptom)
  .then(getRemedy);

homeHealthWorkflow.commit();

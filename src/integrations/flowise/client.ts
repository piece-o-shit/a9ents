
const FLOWISE_URL = 'http://localhost:3000';

export const flowiseClient = {
  async getFlows() {
    const response = await fetch(`${FLOWISE_URL}/api/v1/flows`);
    if (!response.ok) throw new Error('Failed to fetch flows');
    return response.json();
  },

  async createFlow(flowData: any) {
    const response = await fetch(`${FLOWISE_URL}/api/v1/flows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flowData),
    });
    if (!response.ok) throw new Error('Failed to create flow');
    return response.json();
  },

  async deleteFlow(flowId: string) {
    const response = await fetch(`${FLOWISE_URL}/api/v1/flows/${flowId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete flow');
    return response.json();
  },

  async predict(flowId: string, input: any) {
    const response = await fetch(`${FLOWISE_URL}/api/v1/prediction/${flowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Failed to execute prediction');
    return response.json();
  },
};


// File: src/mistral/MistralAPI.ts

import fetch from 'node-fetch';

export class MistralAPI {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async generateResponse(prompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Generative-AI-Application', // Optional for rankings
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

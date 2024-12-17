import fetch from 'node-fetch';

// Define the structure of the API response
interface MistralChoice {
  message: {
    content: string;
  };
}

interface MistralResponse {
  choices: MistralChoice[];
}

// Mistral API Class
export class MistralAPI {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Generate response from Mistral API
  public async generateResponse(prompt: string): Promise<string> {
    try {
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
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Mistral API Error: ${response.status} ${response.statusText}`
        );
      }

      // Explicitly cast the response as MistralResponse
      const data = (await response.json()) as MistralResponse;

      // Check for choices in the response
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Mistral API returned an empty response.');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response from Mistral API:', error);
      throw new Error('Failed to fetch response from Mistral API.');
    }
  }
}

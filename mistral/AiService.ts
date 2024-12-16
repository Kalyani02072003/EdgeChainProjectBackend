import { MistralAPI } from './MistralAPI';
import axios from 'axios';


// AIService class for handling AI-powered recipe processing
export class AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Method to get generative response using OpenRouter API
  public async getGenerativeResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'huggingfaceh4/zephyr-7b-beta:free',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Sorry, I could not generate a response at this time.';
    }
  }

  // Method to extract ingredients from the recipe
  public extractIngredients(recipe: string): string[] {
    const ingredientsPattern = /\b(ingredient|item|produce|spice|veggie|fruit|meat|herb|dairy)\b[^.]*\./gi;
    const matchedIngredients = recipe.match(ingredientsPattern);

    return matchedIngredients ? matchedIngredients.map(item => item.trim()) : [];
  }

  // Method to get nutritional values using Hugging Face Zephyr
  public async getNutritionalValues(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'huggingfaceh4/zephyr-7b-beta:free',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching nutritional data:', error);
      return 'Error fetching nutritional data.';
    }
  }
}


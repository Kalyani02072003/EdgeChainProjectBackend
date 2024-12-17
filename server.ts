import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { AIService } from './mistral/AiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const aiService = new AIService(process.env.OPENROUTER_API_KEY!);

// CORS Setup with Specific Origin
app.use(cors({
  origin: 'https://frontend-omega-six-16.vercel.app', // Ensure this matches your frontend domain exactly
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers like 'Authorization' if required
  credentials: true, // If you're using cookies or other credentials
}));

// Middleware
app.use(bodyParser.json());

// Handle Preflight OPTIONS Request
app.options('*', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', 'https://frontend-omega-six-16.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Route: Generate Recipe
app.post('/generate', async (req: Request, res: Response): Promise<any> => {
  const { input, language = 'en' } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input is required to generate a recipe.' });
  }

  try {
    let recipe = await aiService.getGenerativeResponse(`Generate a recipe for: ${input}`);
    
    // Extract ingredients for additional processing if needed
    const ingredients: string[] = aiService.extractIngredients(recipe);

    // Translate if necessary
    if (language !== 'en') {
      recipe = await translateWithHuggingFace(recipe, language);
    }

    res.json({ recipe, ingredients });
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'An error occurred while generating the recipe.' });
  }
});

// Route: Get Nutrition
app.post('/nutrition', async (req: Request, res: Response): Promise<any> => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input is required to fetch nutritional values.' });
  }

  try {
    const nutritionalValues = await aiService.getNutritionalValues(
      `Provide nutritional values for: ${input}. Include calories, protein, carbs, fats, fiber, and sugar.`
    );

    res.json({ nutritionalValues });
  } catch (error) {
    console.error('Error fetching nutritional values:', error);
    res.status(500).json({ error: 'An error occurred while fetching nutritional values.' });
  }
});

// Example for one route
app.post('/mealplan', async (req: Request, res: Response): Promise<any> => {
  // Set CORS headers explicitly
  res.setHeader('Access-Control-Allow-Origin', 'https://frontend-omega-six-16.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // If using cookies/credentials

  const { input, days = 7, language = 'en' } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input is required to generate a meal plan.' });
  }

  try {
    const mealPlan = [];
    for (let i = 0; i < days; i++) {
      const recipe = await aiService.getGenerativeResponse(
        `Generate a simple meal plan for: ${input} for day ${i + 1}`
      );
      mealPlan.push(recipe);
    }

    if (language !== 'en') {
      const translatedMealPlan = await translateWithHuggingFace(mealPlan.join('\n'), language);
      return res.json({ mealPlan: translatedMealPlan.split('\n') });
    }

    res.json({ mealPlan });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ error: 'An error occurred while generating the meal plan.' });
  }
});



const translateWithHuggingFace = async (text: string, targetLanguage: string): Promise<string> => {
  console.log(`Translating text to ${targetLanguage}: ${text}`);
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'huggingfaceh4/zephyr-7b-beta:free',
        messages: [{ role: 'user', content: `Translate this text to ${targetLanguage}: ${text}` }],
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
        timeout: 10000
      }
    );

    // console.log('Translation response:', response.data);

    if (response.data && response.data.choices) {
      return response.data.choices[0].message.content;
    }

    throw new Error('Translation API response is invalid');
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error('Translation failed');
  }
};

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

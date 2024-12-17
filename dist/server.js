"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const AiService_1 = require("./mistral/AiService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const aiService = new AiService_1.AIService(process.env.OPENROUTER_API_KEY);
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Route: Generate Recipe
app.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { input, language = 'en' } = req.body;
    if (!input) {
        return res.status(400).json({ error: 'Input is required to generate a recipe.' });
    }
    try {
        let recipe = yield aiService.getGenerativeResponse(`Generate a recipe for: ${input}`);
        // Extract ingredients for additional processing if needed
        const ingredients = aiService.extractIngredients(recipe);
        // Translate if necessary
        if (language !== 'en') {
            recipe = yield translateWithHuggingFace(recipe, language);
        }
        res.json({ recipe, ingredients });
    }
    catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ error: 'An error occurred while generating the recipe.' });
    }
}));
// Route: Get Nutrition
app.post('/nutrition', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { input } = req.body;
    if (!input) {
        return res.status(400).json({ error: 'Input is required to fetch nutritional values.' });
    }
    try {
        const nutritionalValues = yield aiService.getNutritionalValues(`Provide nutritional values for: ${input}. Include calories, protein, carbs, fats, fiber, and sugar.`);
        res.json({ nutritionalValues });
    }
    catch (error) {
        console.error('Error fetching nutritional values:', error);
        res.status(500).json({ error: 'An error occurred while fetching nutritional values.' });
    }
}));
// Route: Generate Meal Plan
app.post('/mealplan', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { input, days = 7, language = 'en' } = req.body;
    if (!input) {
        return res.status(400).json({ error: 'Input is required to generate a meal plan.' });
    }
    try {
        const mealPlan = [];
        for (let i = 0; i < days; i++) {
            const recipe = yield aiService.getGenerativeResponse(`Generate a simple meal plan for: ${input} for day ${i + 1}`);
            mealPlan.push(recipe);
        }
        if (language !== 'en') {
            const translatedMealPlan = yield translateWithHuggingFace(mealPlan.join('\n'), language);
            return res.json({ mealPlan: translatedMealPlan.split('\n') });
        }
        res.json({ mealPlan });
    }
    catch (error) {
        console.error('Error generating meal plan:', error);
        res.status(500).json({ error: 'An error occurred while generating the meal plan.' });
    }
}));
// Function: Translate Text using Hugging Face
const translateWithHuggingFace = (text, targetLanguage) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'huggingfaceh4/zephyr-7b-beta:free',
            messages: [{ role: 'user', content: `Translate this text to ${targetLanguage}: ${text}` }],
        }, {
            headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
        });
        if (response.data && response.data.choices) {
            return response.data.choices[0].message.content;
        }
        throw new Error('Translation API response is invalid');
    }
    catch (error) {
        console.error('Error translating text:', error);
        throw new Error('Translation failed');
    }
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

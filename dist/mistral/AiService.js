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
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
// AIService class for handling AI-powered recipe processing
class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    // Method to get generative response using OpenRouter API
    getGenerativeResponse(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: 'huggingfaceh4/zephyr-7b-beta:free',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                }, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data.choices[0].message.content;
            }
            catch (error) {
                console.error('Error generating response:', error);
                return 'Sorry, I could not generate a response at this time.';
            }
        });
    }
    // Method to extract ingredients from the recipe
    extractIngredients(recipe) {
        const ingredientsPattern = /\b(ingredient|item|produce|spice|veggie|fruit|meat|herb|dairy)\b[^.]*\./gi;
        const matchedIngredients = recipe.match(ingredientsPattern);
        return matchedIngredients ? matchedIngredients.map(item => item.trim()) : [];
    }
    // Method to get nutritional values using Hugging Face Zephyr
    getNutritionalValues(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: 'huggingfaceh4/zephyr-7b-beta:free',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                }, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data.choices[0].message.content;
            }
            catch (error) {
                console.error('Error fetching nutritional data:', error);
                return 'Error fetching nutritional data.';
            }
        });
    }
}
exports.AIService = AIService;

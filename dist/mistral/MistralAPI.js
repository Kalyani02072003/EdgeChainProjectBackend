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
exports.MistralAPI = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
// Mistral API Class
class MistralAPI {
    constructor(apiKey) {
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = apiKey;
    }
    // Generate response from Mistral API
    generateResponse(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, node_fetch_1.default)(this.baseUrl, {
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
                    throw new Error(`Mistral API Error: ${response.status} ${response.statusText}`);
                }
                // Explicitly cast the response as MistralResponse
                const data = (yield response.json());
                // Check for choices in the response
                if (!data.choices || data.choices.length === 0) {
                    throw new Error('Mistral API returned an empty response.');
                }
                return data.choices[0].message.content;
            }
            catch (error) {
                console.error('Error generating response from Mistral API:', error);
                throw new Error('Failed to fetch response from Mistral API.');
            }
        });
    }
}
exports.MistralAPI = MistralAPI;

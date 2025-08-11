import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not found. AI analysis will not be available.');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export const geminiModel = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

export default geminiModel;

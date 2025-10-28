import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface IntentResult {
  intent: 'general_talk' | 'text_rec' | 'image_rec';
  cleanedQuery: string;
  conversationResponse?: string;
  imageUrl?: string;
}

export async function classifyIntent(
  userMessage: string,
  hasImage: boolean,
  imageData?: string
): Promise<IntentResult> {
  
  // Build the classification prompt
  const systemPrompt = `You are a shopping assistant intent classifier. Analyze the user's message and determine:

1. Intent classification:
   - "general_talk": greetings, "what's your name", "what can you do", general questions not about products, or vague/ambiguous questions
   - "text_rec": requests to recommend, compare, or find products using text descriptions
   - "image_rec": user provided an image OR text explicitly mentions "like this photo", "find similar" with image context

2. Extract ONLY the product-relevant description (remove fluff, greetings, unnecessary words)

3. Extract image URL if mentioned in text (look for URLs ending in .jpg, .png, .jpeg, or image hosting sites)

Respond in JSON format:
{
  "intent": "general_talk" | "text_rec" | "image_rec",
  "cleanedQuery": "cleaned product description",
  "imageUrl": "url if found in text, otherwise null"
}`;

  const userPrompt = `User message: "${userMessage}"
Has attached image: ${hasImage ? 'Yes' : 'No'}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Determine final intent
    let finalIntent = result.intent;
    let finalImageUrl = result.imageUrl;
    
    // Override: if image is attached, it's image_rec
    if (hasImage || imageData) {
      finalIntent = 'image_rec';
    }
    
    // If intent was classified as image_rec but no image, check for URL
    if (finalIntent === 'image_rec' && !hasImage && result.imageUrl) {
      finalImageUrl = result.imageUrl;
    }
    
    console.log(`🎯 Intent classified: ${finalIntent}`);
    console.log(`📝 Cleaned query: ${result.cleanedQuery}`);
    
    // Generate conversation response if general_talk
    let conversationResponse: string | undefined;
    if (finalIntent === 'general_talk') {
      conversationResponse = await generateConversationResponse(userMessage);
    }
    
    return {
      intent: finalIntent,
      cleanedQuery: result.cleanedQuery || userMessage,
      conversationResponse,
      imageUrl: finalImageUrl
    };
    
  } catch (error) {
    console.error('Error classifying intent:', error);
    // Default fallback
    return {
      intent: hasImage ? 'image_rec' : 'text_rec',
      cleanedQuery: userMessage,
      conversationResponse: undefined,
      imageUrl: undefined
    };
  }
}

async function generateConversationResponse(userMessage: string): Promise<string> {
  const systemPrompt = `You are "Commerce Concierge", a friendly shopping assistant. Follow these rules:

- Be conversational and friendly
- Keep responses SHORT (2-3 sentences max)
- If asked what you can do, say: "I help you find great products from our catalog. You can even upload a photo, and I'll find similar items."
- If asked your name, say: "I'm Commerce Concierge"
- If asked who you represent, say: "I'm your personal shopping helper"
- NEVER make up products that don't exist
- After answering, ask ONE quick follow-up to guide the search
- Offer 2-3 simple choices (e.g., "Shoes, bags, or jackets?" or "For men, women, or kids?")

Examples:
User: "Hi"
You: "Hey there! 👋 I'm Commerce Concierge, your personal shopping helper. What are you looking for today—clothing, accessories, or electronics?"

User: "What can you do?"
You: "I help you find great products from our catalog. You can even upload a photo, and I'll find similar items. Are you shopping for something specific today?"`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content || "Hi! I'm Commerce Concierge. What are you shopping for today?";
    
  } catch (error) {
    console.error('Error generating conversation response:', error);
    return "Hi! I'm Commerce Concierge, your shopping helper. What can I help you find today?";
  }
}